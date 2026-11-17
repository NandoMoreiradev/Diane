import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resolveUserPermissions } from './permissions/permission-catalog';

export const ACCESS_TOKEN_TYPE = 'access';

export interface AccessTokenClaims {
  sub?: string;
  email?: string;
  name?: string;
  typ?: string;
  sid?: string;
  iat?: number;
}

interface SessionState {
  usable: boolean;
  validAfterMs: number | null;
  sessionAlive: boolean | null;
  role: string;
  permissions: string[];
  name: string;
  email: string;
  expiresAt: number;
}

@Injectable()
export class SessionValidationService {
  private static readonly CACHE_TTL_MS = 15_000;
  private readonly cache = new Map<string, SessionState>();

  constructor(private readonly prisma: PrismaService) {}

  forgetUser(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}|`)) this.cache.delete(key);
    }
  }

  async validateAccessToken(payload: AccessTokenClaims) {
    if (!payload?.sub || payload.typ !== ACCESS_TOKEN_TYPE) {
      throw new UnauthorizedException('Token de sessão inválido.');
    }

    const key = `${payload.sub}|${payload.sid ?? ''}`;
    let state = this.cache.get(key);
    if (!state || state.expiresAt <= Date.now()) {
      const [user, liveToken] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: { roleRef: true },
        }),
        payload.sid
          ? this.prisma.refreshToken.findFirst({
              where: {
                familyId: payload.sid,
                userId: payload.sub,
                isRevoked: false,
                expiresAt: { gt: new Date() },
              },
              select: { id: true },
            })
          : Promise.resolve(undefined),
      ]);

      state = {
        usable: Boolean(user && user.active),
        validAfterMs: user?.sessionsValidAfter?.getTime() ?? null,
        sessionAlive: payload.sid ? Boolean(liveToken) : null,
        role: user?.role ?? 'BALCAO',
        permissions: user ? resolveUserPermissions(user) : [],
        name: user?.name ?? '',
        email: user?.email ?? '',
        expiresAt: Date.now() + SessionValidationService.CACHE_TTL_MS,
      };
      this.cache.set(key, state);
    }

    if (!state.usable) {
      throw new UnauthorizedException('Usuário inativo ou removido.');
    }
    if (state.validAfterMs !== null && (payload.iat ?? 0) < Math.floor(state.validAfterMs / 1000)) {
      throw new UnauthorizedException('Sessão encerrada. Faça login novamente.');
    }
    if (state.sessionAlive === false) {
      throw new UnauthorizedException('Sessão encerrada. Faça login novamente.');
    }

    return {
      sub: payload.sub,
      email: state.email,
      name: state.name,
      role: state.role,
      permissions: state.permissions,
      sid: payload.sid,
    };
  }
}

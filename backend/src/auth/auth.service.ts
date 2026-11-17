import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginAttemptsService } from './login-attempts.service';
import { resolveUserPermissions } from './permissions/permission-catalog';
import { ACCESS_TOKEN_TYPE, AccessTokenClaims, SessionValidationService } from './session-validation.service';
import { sessionJwtSecretFor } from './jwt-secrets';

const REFRESH_TTL_DAYS = 7;

export interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly loginAttempts: LoginAttemptsService,
    private readonly sessionValidation: SessionValidationService,
  ) {}

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async issueSession(userId: string, meta: SessionMeta, existingFamilyId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roleRef: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário inativo ou não encontrado.');
    }

    const familyId = existingFamilyId || randomUUID();
    const rawRefreshToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        familyId,
        userId: user.id,
        expiresAt,
        ipAddress: meta.ipAddress?.slice(0, 64),
        userAgent: meta.userAgent?.slice(0, 200),
      },
    });

    const permissions = resolveUserPermissions(user);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      typ: ACCESS_TOKEN_TYPE,
      sid: familyId,
    });

    return {
      accessToken,
      rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        roleName: user.roleRef?.nome ?? user.role,
        permissions,
      },
    };
  }

  async login(email: string, password: string, meta: SessionMeta = {}) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.active) {
      this.loginAttempts.recordFailure(normalizedEmail);
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      this.loginAttempts.recordFailure(normalizedEmail);
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    this.loginAttempts.reset(normalizedEmail);
    return this.issueSession(user.id, meta);
  }

  async refresh(rawRefreshToken: string | undefined, meta: SessionMeta = {}) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token ausente.');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Sessão inválida.');
    }

    // Detecção de reuso: se um token já revogado for apresentado, revoga toda a família!
    if (stored.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId },
        data: { isRevoked: true },
      });
      this.sessionValidation.forgetUser(stored.userId);
      throw new UnauthorizedException('Sessão revogada por segurança. Faça login novamente.');
    }

    if (stored.expiresAt <= new Date() || !stored.user.active) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Rotação: revoga o token atual e emite um novo na mesma família
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    return this.issueSession(stored.userId, meta, stored.familyId);
  }

  async logout(rawRefreshToken: string | undefined, userId?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
      if (stored) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: stored.familyId },
          data: { isRevoked: true },
        });
        this.sessionValidation.forgetUser(stored.userId);
      }
    } else if (userId) {
      this.sessionValidation.forgetUser(userId);
    }
    return { ok: true };
  }

  async logoutAll(userId: string) {
    await Promise.all([
      this.prisma.user.update({
        where: { id: userId },
        data: { sessionsValidAfter: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);
    this.sessionValidation.forgetUser(userId);
    return { ok: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await Promise.all([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash, sessionsValidAfter: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);
    this.sessionValidation.forgetUser(userId);
    return { ok: true };
  }

  async verifyAccessToken(token: string) {
    const payload = this.jwtService.verify<AccessTokenClaims>(token, {
      secret: sessionJwtSecretFor(token),
    });
    return this.sessionValidation.validateAccessToken(payload);
  }
}

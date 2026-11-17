import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const PERMISSION_KEY = 'requiredPermission';
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);

export interface AuthenticatedUser {
  sub: string;
  email: string;
  name: string;
  role: Role;
  permissions: string[];
  sid?: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    if (user.role === Role.ADMIN || user.permissions?.includes(required)) {
      return true;
    }

    throw new ForbiddenException(`Permissão "${required}" necessária para esta ação.`);
  }
}

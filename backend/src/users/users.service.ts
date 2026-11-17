import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS, PERMISSION_CATALOG, resolveUserPermissions } from '../auth/permissions/permission-catalog';
import { SessionValidationService } from '../auth/session-validation.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionValidation: SessionValidationService,
  ) {}

  getPermissionsCatalog() {
    return PERMISSION_CATALOG;
  }

  async listRoles() {
    return this.prisma.roleDefinition.findMany({ orderBy: { nome: 'asc' } });
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      include: { roleRef: true },
      orderBy: { createdAt: 'asc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      roleId: u.roleId,
      roleName: u.roleRef?.nome ?? u.role,
      directPermissions: u.directPermissions,
      effectivePermissions: resolveUserPermissions(u),
      active: u.active,
      createdAt: u.createdAt,
    }));
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    roleId?: string;
    directPermissions?: string[];
  }) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Já existe um usuário com este e-mail.');
    }

    const validPerms = (data.directPermissions ?? []).filter((p) =>
      (ALL_PERMISSIONS as string[]).includes(p),
    );
    let legacyRole: Role = Role.BALCAO;
    if (data.roleId) {
      const roleDef = await this.prisma.roleDefinition.findUnique({ where: { id: data.roleId } });
      if (!roleDef) throw new BadRequestException('Cargo inválido.');
      if (roleDef.slug === 'socia' || roleDef.slug === 'admin') legacyRole = Role.SOCIA;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = await this.prisma.user.create({
      data: {
        email,
        name: data.name.trim(),
        passwordHash,
        role: legacyRole,
        roleId: data.roleId || null,
        directPermissions: validPerms,
      },
      include: { roleRef: true },
    });

    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      roleId: created.roleId,
      roleName: created.roleRef?.nome ?? created.role,
      directPermissions: created.directPermissions,
      effectivePermissions: resolveUserPermissions(created),
      active: created.active,
    };
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      active?: boolean;
      roleId?: string | null;
      directPermissions?: string[];
      newPassword?: string;
    },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Usuário não encontrado.');

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.active !== undefined) updateData.active = data.active;
    if (data.directPermissions !== undefined) {
      updateData.directPermissions = data.directPermissions.filter((p) =>
        (ALL_PERMISSIONS as string[]).includes(p),
      );
    }
    if (data.roleId !== undefined) {
      if (data.roleId) {
        const roleDef = await this.prisma.roleDefinition.findUnique({ where: { id: data.roleId } });
        if (!roleDef) throw new BadRequestException('Cargo inválido.');
        updateData.roleId = roleDef.id;
        updateData.role = roleDef.slug === 'socia' || roleDef.slug === 'admin' ? Role.SOCIA : Role.BALCAO;
      } else {
        updateData.roleId = null;
      }
    }
    if (data.newPassword) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
      updateData.sessionsValidAfter = new Date();
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { roleRef: true },
    });

    if (data.active === false || data.newPassword) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });
    }
    this.sessionValidation.forgetUser(id);

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      roleId: updated.roleId,
      roleName: updated.roleRef?.nome ?? updated.role,
      directPermissions: updated.directPermissions,
      effectivePermissions: resolveUserPermissions(updated),
      active: updated.active,
    };
  }
}

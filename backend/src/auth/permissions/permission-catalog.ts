import { Role } from '@prisma/client';

export const PERMISSION_CATALOG = [
  { key: 'orders:read', label: 'Ver pedidos do balcão', group: 'Operação' },
  { key: 'orders:manage', label: 'Aceitar, preparar, finalizar e cancelar pedidos', group: 'Operação' },
  { key: 'counter:sale', label: 'Registrar venda no balcão', group: 'Operação' },
  { key: 'dre:read', label: 'Visualizar Resultado (DRE e KPIs)', group: 'Financeiro' },
  { key: 'catalog:manage', label: 'Gerenciar cardápio, preços e entregas', group: 'Gestão' },
  { key: 'config:manage', label: 'Alterar horários, WhatsApp e configurações', group: 'Gestão' },
  { key: 'users:manage', label: 'Gerenciar usuários e permissões', group: 'Administração' },
] as const;

export type PermissionKey = (typeof PERMISSION_CATALOG)[number]['key'];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_CATALOG.map((p) => p.key);

export function resolveUserPermissions(user: {
  role: Role;
  directPermissions?: string[] | null;
  roleRef?: { permissions: string[] } | null;
}): string[] {
  if (user.role === Role.ADMIN) {
    return ALL_PERMISSIONS;
  }
  const rolePerms = user.roleRef?.permissions ?? (user.role === Role.SOCIA ? ALL_PERMISSIONS : ['orders:read', 'orders:manage', 'counter:sale']);
  const direct = user.directPermissions ?? [];
  return [...new Set([...rolePerms, ...direct])];
}

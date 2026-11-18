/**
 * Bootstrap de PRODUÇÃO (idempotente e não destrutivo).
 *
 * - Cria cargos e o cardápio inicial somente se ainda não existirem.
 * - Cria o primeiro usuário administrador a partir de variáveis de ambiente.
 * - Nunca sobrescreve senha, preços ou configurações já existentes.
 *
 * Variáveis: BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD (mín. 12 caracteres),
 * BOOTSTRAP_ADMIN_NAME (opcional).
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCatalog, seedRoles } from './seed-shared';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';
  const name = (process.env.BOOTSTRAP_ADMIN_NAME ?? 'Administração Dianê').trim();

  const { roleSocia } = await seedRoles(prisma);
  await seedCatalog(prisma, false);

  const usersCount = await prisma.user.count();
  const existing = email ? await prisma.user.findUnique({ where: { email } }) : null;

  if (existing) {
    console.log(`Administrador ${email} já existe: nada alterado.`);
  } else if (email || password) {
    if (!email || password.length < 12) {
      throw new Error(
        'Informe BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD (mínimo 12 caracteres).',
      );
    }
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await bcrypt.hash(password, 12),
        role: Role.SOCIA,
        roleId: roleSocia.id,
      },
    });
    console.log(`Administrador ${email} criado. Remova BOOTSTRAP_ADMIN_PASSWORD das variáveis.`);
  } else if (usersCount === 0) {
    throw new Error(
      'Banco sem usuários: defina BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD para criar o primeiro acesso.',
    );
  }

  console.log('Bootstrap concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

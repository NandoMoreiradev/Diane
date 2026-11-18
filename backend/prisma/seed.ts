/**
 * Seed de DESENVOLVIMENTO: cria usuários de demonstração e o cardápio inicial.
 * Em produção use `npm run prisma:bootstrap` (não cria senhas padrão).
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCatalog, seedRoles } from './seed-shared';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error(
      'Seed de demonstração bloqueado em produção (cria senhas padrão). Use `npm run prisma:bootstrap`.',
    );
  }

  const { roleSocia, roleBalcao } = await seedRoles(prisma);

  const sociaPassword = await bcrypt.hash(process.env.SEED_SOCIA_PASSWORD || 'diane2026', 10);
  const balcaoPassword = await bcrypt.hash(process.env.SEED_BALCAO_PASSWORD || 'balcao2026', 10);

  await prisma.user.upsert({
    where: { email: 'socia@diane.com.br' },
    update: { roleId: roleSocia.id },
    create: {
      email: 'socia@diane.com.br',
      name: 'Sócia Dianê',
      passwordHash: sociaPassword,
      role: Role.SOCIA,
      roleId: roleSocia.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'balcao@diane.com.br' },
    update: { roleId: roleBalcao.id },
    create: {
      email: 'balcao@diane.com.br',
      name: 'Equipe Balcão',
      passwordHash: balcaoPassword,
      role: Role.BALCAO,
      roleId: roleBalcao.id,
    },
  });

  await seedCatalog(prisma, true);
  console.log('Seed de desenvolvimento da Dianê concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

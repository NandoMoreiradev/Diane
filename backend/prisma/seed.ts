import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const vezes = (id: string, n: number) => Array<string>(n).fill(id);

async function main() {
  // 1. Cargos com permissões granulares
  const allPermissions = [
    'orders:read',
    'orders:manage',
    'counter:sale',
    'dre:read',
    'catalog:manage',
    'config:manage',
    'users:manage',
  ];

  const roleSocia = await prisma.roleDefinition.upsert({
    where: { slug: 'socia' },
    update: {
      nome: 'Sócia / Administração',
      descricao: 'Acesso completo ao balcão, DRE, cardápio, configurações e equipe.',
      permissions: allPermissions,
    },
    create: {
      slug: 'socia',
      nome: 'Sócia / Administração',
      descricao: 'Acesso completo ao balcão, DRE, cardápio, configurações e equipe.',
      permissions: allPermissions,
    },
  });

  const roleBalcao = await prisma.roleDefinition.upsert({
    where: { slug: 'balcao' },
    update: {
      nome: 'Atendente de Balcão',
      descricao: 'Visualiza e gerencia pedidos e registra vendas no balcão.',
      permissions: ['orders:read', 'orders:manage', 'counter:sale'],
    },
    create: {
      slug: 'balcao',
      nome: 'Atendente de Balcão',
      descricao: 'Visualiza e gerencia pedidos e registra vendas no balcão.',
      permissions: ['orders:read', 'orders:manage', 'counter:sale'],
    },
  });

  // 2. Usuários iniciais da equipe (troque as senhas em produção)
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

  // 2. Configuração da loja e DRE (migrado de diane-site/cardapio.js)
  await prisma.storeConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      whatsapp: '',
      abre: 7,
      fecha: 17,
      diasAbertos: [1, 2, 3, 4, 5, 6],
      entrega: true,
      pedidoMinimo: 25,
      freteGratisAcima: 80,
      custoPorEntrega: 0,
      urlSite: '',
      mesas: [],
      dre: {
        custosFixos: [
          { nome: 'Colaborador (salário + encargos)', valor: 2200 },
          { nome: 'Aluguel', valor: 800 },
          { nome: 'Energia', valor: 700 },
          { nome: 'Cozinha de produção', valor: 400 },
          { nome: 'Marketing e Instagram', valor: 300 },
          { nome: 'Contador, internet, sistema, limpeza', valor: 650 },
        ],
        simples: 0.06,
        taxas: { Cartão: 0.025, Pix: 0, Dinheiro: 0 },
        perdas: 0.04,
        diasAbertosNoMes: 24,
        reserva: 0.5,
        socios: ['Sócia 1', 'Sócia 2'],
      },
    },
  });

  // 3. Zonas de entrega
  const zones = [
    {
      id: 'pertinho',
      nome: 'Pertinho',
      ate: 'até 1,5 km',
      taxa: 4,
      prazo: '20 a 30 min',
      bairros: ['São José', 'Centro', 'Treze de Julho', 'Salgado Filho', 'Suíssa'],
      ordem: 1,
    },
    {
      id: 'perto',
      nome: 'Perto',
      ate: '1,5 a 2,5 km',
      taxa: 6,
      prazo: '25 a 35 min',
      bairros: ['Cirurgia', 'Grageru', 'Getúlio Vargas', 'Pereira Lobo', 'Jardins', 'Luzia'],
      ordem: 2,
    },
    {
      id: 'um-pouco-mais-longe',
      nome: 'Um pouco mais longe',
      ate: '2,5 a 3,8 km',
      taxa: 8,
      prazo: '30 a 45 min',
      bairros: [
        'Siqueira Campos',
        'Santo Antônio',
        'Industrial',
        'Ponto Novo',
        'Dezoito do Forte',
        'América',
        'Palestina',
        'Inácio Barbosa',
      ],
      ordem: 3,
    },
  ];

  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: z.id },
      update: z,
      create: z,
    });
  }

  // 4. Grupos de sabores
  const flavorGroups = [
    {
      slug: 'brigadeiro',
      nome: 'Brigadeiro',
      sabores: ['Tradicional', 'Ninho', 'Pistache', 'Morango', 'Churros', 'Café', 'Maracujá'],
    },
    {
      slug: 'caixa',
      nome: 'Caixa',
      sabores: [
        'Sortida da casa',
        'Clássicos (tradicional e ninho)',
        'Frutados (morango, maracujá e pistache)',
        'Escolho na observação',
      ],
    },
    {
      slug: 'bolo',
      nome: 'Bolo',
      sabores: ['Cenoura com brigadeiro', 'Chocolate com brigadeiro', 'Ninho com morango'],
    },
    {
      slug: 'torta',
      nome: 'Torta',
      sabores: ['Limão', 'Morango', 'Banoffee'],
    },
    {
      slug: 'sanduiche',
      nome: 'Sanduíche',
      sabores: ['Frango com cenoura', 'Atum', 'Peito de peru com ricota', 'Caprese (vegetariano)'],
    },
    {
      slug: 'frutales',
      nome: 'Frutales',
      sabores: ['Frutas do dia', 'Com granola e mel'],
    },
  ];

  for (const fg of flavorGroups) {
    await prisma.flavorGroup.upsert({
      where: { slug: fg.slug },
      update: fg,
      create: fg,
    });
  }

  // 5. Produtos
  const products = [
    // doces
    { id: 'brigadeiro', cat: 'doces', nome: 'Brigadeiro gourmet', desc: 'Feito à mão, na forminha. Escolha o sabor.', preco: 4.5, custo: 1.3, arte: 'brigadeiro', saboresSlug: 'brigadeiro', tag: 'O da casa' },
    { id: 'caixa-4', cat: 'doces', nome: 'Caixa com 4', desc: 'Lembrancinha creme, lacrada com o selo da marca.', preco: 17, custo: 5.6, arte: 'caixa', saboresSlug: 'caixa' },
    { id: 'caixa-6', cat: 'doces', nome: 'Caixa com 6', desc: 'Com cinta chocolate e o cartão "pra você".', preco: 25, custo: 8.4, arte: 'caixa', saboresSlug: 'caixa' },
    { id: 'caixa-12', cat: 'doces', nome: 'Caixa com 12', desc: 'A caixa de presente: tampa caramelo e fundo chocolate.', preco: 48, custo: 16.5, arte: 'caixa', saboresSlug: 'caixa', tag: 'Para presentear' },
    { id: 'caixa-25', cat: 'doces', nome: 'Caixa com 25', desc: 'Para a festa, a reunião ou a família toda.', preco: 95, custo: 33, arte: 'caixa', saboresSlug: 'caixa' },
    { id: 'colher', cat: 'doces', nome: 'Brigadeiro de colher', desc: 'No pote de 150 ml, para comer devagar.', preco: 14, custo: 4.2, arte: 'pote' },
    { id: 'bolo', cat: 'doces', nome: 'Fatia de bolo', desc: 'Bolo com gosto de casa, na embalagem para levar.', preco: 12, custo: 3.6, arte: 'bolo', saboresSlug: 'bolo' },
    { id: 'torta', cat: 'doces', nome: 'Fatia de torta', desc: 'A torta do dia, na embalagem para levar.', preco: 14, custo: 4.6, arte: 'torta', saboresSlug: 'torta' },
    // lanches
    { id: 'pao', cat: 'lanches', nome: 'Pão de queijo mineiro', desc: 'Quentinho, saído do forno.', preco: 5, custo: 1.5, arte: 'pao', tag: 'Mais pedido' },
    { id: 'sanduiche', cat: 'lanches', nome: 'Sanduíche natural', desc: 'Pão macio, recheio leve e salada fresca. Escolha o sabor.', preco: 16, custo: 7, arte: 'sanduiche', saboresSlug: 'sanduiche' },
    { id: 'frutales', cat: 'lanches', nome: 'Frutales', desc: 'Frutas frescas no copo de 400 ml, com tampa.', preco: 14, custo: 5.5, arte: 'frutales', saboresSlug: 'frutales', tag: 'Novidade' },
    // cafés e bebidas
    { id: 'expresso', cat: 'cafes', nome: 'Expresso curto', desc: 'Curto e intenso. 80 ml.', preco: 6, custo: 1.3, arte: 'espresso' },
    { id: 'americano', cat: 'cafes', nome: 'Expresso americano', desc: 'Expresso com água quente. 200 ml.', preco: 7, custo: 1.4, arte: 'viagem' },
    { id: 'duplo', cat: 'cafes', nome: 'Expresso duplo', desc: 'Duas doses, para quem precisa. 120 ml.', preco: 9, custo: 2.4, arte: 'espresso' },
    { id: 'cafe-leite-p', cat: 'cafes', nome: 'Café com leite pequeno', desc: 'Cremoso, no copo de 200 ml.', preco: 6, custo: 1.6, arte: 'cappuccino' },
    { id: 'cafe-leite', cat: 'cafes', nome: 'Café com leite', desc: 'Cremoso, no copo de 300 ml.', preco: 9, custo: 2.4, arte: 'viagem' },
    { id: 'cappuccino', cat: 'cafes', nome: 'Cappuccino', desc: 'Café, leite e espuma cremosa. 200 ml.', preco: 10, custo: 2.5, arte: 'cappuccino' },
    { id: 'cappuccino-alpino', cat: 'cafes', nome: 'Cappuccino Alpino', desc: 'Cappuccino com chocolate Alpino. 200 ml.', preco: 12, custo: 3.2, arte: 'cappuccino' },
    { id: 'mokaccino', cat: 'cafes', nome: 'Mokaccino 2 Frades', desc: 'Café, chocolate 2 Frades e leite. 200 ml.', preco: 12, custo: 3.2, arte: 'cappuccino' },
    { id: 'choc-alpino', cat: 'cafes', nome: 'Achocolatado Alpino', desc: 'Chocolate quente cremoso. 200 ml.', preco: 10, custo: 2.8, arte: 'chocolate' },
    { id: 'choc-frades', cat: 'cafes', nome: 'Achocolatado 2 Frades', desc: 'Chocolate quente mais intenso. 200 ml.', preco: 10, custo: 2.8, arte: 'chocolate' },
    { id: 'kitkat', cat: 'cafes', nome: 'Kit Kat', desc: 'Bebida quente de chocolate com wafer. 200 ml.', preco: 13, custo: 3.6, arte: 'chocolate' },
    { id: 'agua', cat: 'cafes', nome: 'Água mineral', desc: 'Com ou sem gás. 500 ml.', preco: 4, custo: 1.5, arte: 'agua' },
    { id: 'refri', cat: 'cafes', nome: 'Refrigerante', desc: 'Lata de 350 ml.', preco: 7, custo: 3.5, arte: 'lata' },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await prisma.product.upsert({
      where: { id: p.id },
      update: { ...p, ordem: i + 1 },
      create: { ...p, ordem: i + 1 },
    });
  }

  // 6. Combos
  const combos = [
    { id: 'c-pausa', nome: 'Pausa doce', desc: 'Expresso curto + brigadeiro. O intervalo perfeito.', itens: ['expresso', 'brigadeiro'], arte: [], preco: 9.5, selo: 'A qualquer hora', saboresSlug: 'brigadeiro', pessoas: 1, onde: ['delivery'] },
    { id: 'c-manha', nome: 'Manhã mineira', desc: 'Café com leite + 2 pães de queijo.', itens: ['cafe-leite', 'pao', 'pao'], arte: ['viagem', 'pao'], preco: 17, selo: 'Manhã', pessoas: 1, onde: ['delivery'] },
    { id: 'c-leve', nome: 'Almoço leve', desc: 'Sanduíche natural + Frutales. Leve e rápido.', itens: ['sanduiche', 'frutales'], arte: [], preco: 27, selo: 'Almoço', saboresSlug: 'sanduiche', pessoas: 1, onde: ['delivery'] },
    { id: 'c-cafe-2', nome: 'Café a dois', desc: '2 cappuccinos + 4 pães de queijo + 2 brigadeiros.', itens: [...vezes('cappuccino', 2), ...vezes('pao', 4), ...vezes('brigadeiro', 2)], arte: ['cappuccino', 'pao', 'brigadeiro'], preco: 42, selo: 'Manhã e tarde', saboresSlug: 'brigadeiro', pessoas: 2, onde: ['delivery'] },
    { id: 'c-almoco-2', nome: 'Almoço a dois', desc: '2 sanduíches naturais + 2 Frutales.', itens: [...vezes('sanduiche', 2), ...vezes('frutales', 2)], arte: ['sanduiche', 'frutales'], preco: 54, selo: 'Almoço', saboresSlug: 'sanduiche', pessoas: 2, onde: ['delivery'] },
    { id: 'c-tarde-2', nome: 'Tarde a dois', desc: '2 cappuccinos + 2 fatias de bolo.', itens: [...vezes('cappuccino', 2), ...vezes('bolo', 2)], arte: ['cappuccino', 'bolo'], preco: 39, selo: 'Tarde', saboresSlug: 'bolo', pessoas: 2, onde: ['delivery'] },
    { id: 'c-reuniao-6', nome: 'Café da reunião', desc: '6 cafés com leite + 12 pães de queijo + 6 brigadeiros, na caixa de reunião.', itens: [...vezes('cafe-leite', 6), ...vezes('pao', 12), ...vezes('brigadeiro', 6)], arte: ['viagem', 'pao', 'brigadeiro'], preco: 129, selo: 'Reunião', saboresSlug: 'brigadeiro', pessoas: 6, onde: ['delivery'] },
    { id: 'c-lanche-6', nome: 'Lanche da reunião', desc: '6 sanduíches + 12 pães de queijo + 6 cafés com leite + 6 brigadeiros.', itens: [...vezes('sanduiche', 6), ...vezes('pao', 12), ...vezes('cafe-leite', 6), ...vezes('brigadeiro', 6)], arte: ['sanduiche', 'viagem', 'brigadeiro'], preco: 210, selo: 'Reunião', saboresSlug: 'sanduiche', pessoas: 6, onde: ['delivery'] },
    { id: 'c-lanche-10', nome: 'Reunião para 10', desc: '10 sanduíches + 20 pães de queijo + 10 cafés com leite + 10 brigadeiros.', itens: [...vezes('sanduiche', 10), ...vezes('pao', 20), ...vezes('cafe-leite', 10), ...vezes('brigadeiro', 10)], arte: ['sanduiche', 'viagem', 'brigadeiro'], preco: 340, selo: 'Reunião', saboresSlug: 'sanduiche', pessoas: 10, onde: ['delivery'] },
    { id: 'c-lanche-20', nome: 'Reunião para 20', desc: '20 sanduíches + 40 pães de queijo + 20 cafés com leite + 20 brigadeiros.', itens: [...vezes('sanduiche', 20), ...vezes('pao', 40), ...vezes('cafe-leite', 20), ...vezes('brigadeiro', 20)], arte: ['sanduiche', 'viagem', 'brigadeiro'], preco: 660, selo: 'Reunião', saboresSlug: 'sanduiche', pessoas: 20, onde: ['delivery'] },
  ];

  for (let i = 0; i < combos.length; i++) {
    const c = combos[i];
    await prisma.combo.upsert({
      where: { id: c.id },
      update: { ...c, ordem: i + 1 },
      create: { ...c, ordem: i + 1 },
    });
  }

  console.log('Seed da Dianê concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicCatalog() {
    const [config, zones, flavorGroups, products, combos] = await Promise.all([
      this.prisma.storeConfig.findUnique({ where: { id: 'default' } }),
      this.prisma.deliveryZone.findMany({ orderBy: { ordem: 'asc' } }),
      this.prisma.flavorGroup.findMany(),
      this.prisma.product.findMany({
        where: { ativo: true },
        orderBy: { ordem: 'asc' },
      }),
      this.prisma.combo.findMany({
        where: { ativo: true },
        orderBy: { ordem: 'asc' },
      }),
    ]);

    if (!config) {
      throw new NotFoundException('Configuração da loja não encontrada. Execute o seed do banco.');
    }

    return {
      config: {
        whatsapp: config.whatsapp,
        abre: config.abre,
        fecha: config.fecha,
        diasAbertos: config.diasAbertos,
        entrega: config.entrega,
        delivery: {
          pedidoMinimo: config.pedidoMinimo,
          freteGratisAcima: config.freteGratisAcima,
          zonas: zones.map((z) => ({
            id: z.id,
            nome: z.nome,
            ate: z.ate,
            taxa: z.taxa,
            prazo: z.prazo,
            bairros: z.bairros,
          })),
        },
        urlSite: config.urlSite,
        mesas: config.mesas as Array<{ n: number; nome: string }>,
      },
      sabores: Object.fromEntries(flavorGroups.map((g) => [g.slug, g.sabores])),
      saboresNome: Object.fromEntries(flavorGroups.map((g) => [g.slug, g.nome])),
      produtos: products.map((p) => ({
        id: p.id,
        cat: p.cat,
        nome: p.nome,
        desc: p.desc,
        preco: p.preco,
        arte: p.arte,
        sabores: p.saboresSlug,
        tag: p.tag,
        soNaMesa: p.soNaMesa,
      })),
      combos: combos.map((c) => ({
        id: c.id,
        nome: c.nome,
        desc: c.desc,
        itens: c.itens,
        arte: c.arte.length ? c.arte : undefined,
        preco: c.preco,
        selo: c.selo,
        sabores: c.saboresSlug,
        pessoas: c.pessoas,
        onde: c.onde,
      })),
    };
  }

  /** Dados financeiros sensíveis: somente para quem tem `dre:read`. */
  async getDreData() {
    const [config, products, combos] = await Promise.all([
      this.prisma.storeConfig.findUnique({ where: { id: 'default' } }),
      this.prisma.product.findMany({ select: { id: true, custo: true } }),
      this.prisma.combo.findMany({ select: { id: true, itens: true } }),
    ]);
    if (!config) throw new NotFoundException('Configuração da loja não encontrada.');
    const custos: Record<string, number> = Object.fromEntries(products.map((p) => [p.id, p.custo]));
    const productCost = new Map(products.map((p) => [p.id, p.custo]));
    for (const c of combos) {
      custos[c.id] = Number(c.itens.reduce((sum, pid) => sum + (productCost.get(pid) ?? 0), 0).toFixed(2));
    }
    return { dre: config.dre, custoPorEntrega: config.custoPorEntrega, custos };
  }

  async getAdminCatalog() {
    const [config, products, combos] = await Promise.all([
      this.prisma.storeConfig.findUnique({ where: { id: 'default' } }),
      this.prisma.product.findMany({ orderBy: { ordem: 'asc' } }),
      this.prisma.combo.findMany({ orderBy: { ordem: 'asc' } }),
    ]);
    // O DRE só é entregue por /catalog/dre (permissão `dre:read`).
    const { dre: _dre, ...configWithoutDre } = config ?? ({} as NonNullable<typeof config>);
    return { config: config ? configWithoutDre : null, products, combos };
  }

  async updateProduct(id: string, data: { preco?: number; custo?: number; ativo?: boolean }) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Produto não encontrado.');
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(data.preco !== undefined ? { preco: data.preco } : {}),
        ...(data.custo !== undefined ? { custo: data.custo } : {}),
        ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
      },
    });
  }

  async updateConfig(data: {
    whatsapp?: string;
    urlSite?: string;
    abre?: number;
    fecha?: number;
    entrega?: boolean;
    pedidoMinimo?: number;
    freteGratisAcima?: number;
  }) {
    return this.prisma.storeConfig.update({
      where: { id: 'default' },
      data,
    });
  }
}

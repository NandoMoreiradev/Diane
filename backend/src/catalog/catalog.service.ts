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
          custoPorEntrega: config.custoPorEntrega,
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
        dre: config.dre,
      },
      sabores: Object.fromEntries(flavorGroups.map((g) => [g.slug, g.sabores])),
      saboresNome: Object.fromEntries(flavorGroups.map((g) => [g.slug, g.nome])),
      produtos: products.map((p) => ({
        id: p.id,
        cat: p.cat,
        nome: p.nome,
        desc: p.desc,
        preco: p.preco,
        custo: p.custo,
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

  async getAdminCatalog() {
    const [config, products, combos] = await Promise.all([
      this.prisma.storeConfig.findUnique({ where: { id: 'default' } }),
      this.prisma.product.findMany({ orderBy: { ordem: 'asc' } }),
      this.prisma.combo.findMany({ orderBy: { ordem: 'asc' } }),
    ]);
    return { config, products, combos };
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

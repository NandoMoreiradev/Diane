import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderChannel, OrderItem, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventsService } from './events.service';

type OrderWithItems = Order & { itens: OrderItem[] };

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  private generateCode(): string {
    const letters = 'ACDEFGHJKMNPQRTUVWXY';
    const digits = '2346789';
    return (
      letters[Math.floor(Math.random() * letters.length)] +
      digits[Math.floor(Math.random() * digits.length)] +
      letters[Math.floor(Math.random() * letters.length)]
    );
  }

  private normalizeText(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  serialize(order: OrderWithItems) {
    return {
      id: order.id,
      codigo: order.codigo,
      canal: order.canal,
      mesa: order.mesa,
      nome: order.nome,
      telefone: order.telefone,
      local: order.local,
      bairro: order.bairro,
      quando: order.quando,
      pagamento: order.pagamento,
      obs: order.obs,
      subtotal: order.subtotal,
      frete: order.frete,
      total: order.total,
      status: order.status,
      criadoEm: order.criadoEm.getTime(),
      em_preparo: order.emPreparo?.getTime() ?? null,
      em_pronto: order.emPronto?.getTime() ?? null,
      em_entregue: order.emEntregue?.getTime() ?? null,
      em_cancelado: order.emCancelado?.getTime() ?? null,
      itens: order.itens.map((i) => ({
        id: i.itemId,
        nome: i.nome,
        q: i.q,
        preco: i.preco,
        custo: i.custo,
        sabor: i.sabor,
      })),
    };
  }

  serializePublic(order: OrderWithItems) {
    return {
      id: order.id,
      codigo: order.codigo,
      canal: order.canal,
      mesa: order.mesa,
      status: order.status,
      subtotal: order.subtotal,
      frete: order.frete,
      total: order.total,
      criadoEm: order.criadoEm.getTime(),
      itens: order.itens.map((i) => ({
        id: i.itemId,
        nome: i.nome,
        q: i.q,
        preco: i.preco,
        sabor: i.sabor,
      })),
    };
  }

  private async resolveOrderData(dto: CreateOrderDto, isCounter: boolean) {
    const [products, combos, config, zones] = await Promise.all([
      this.prisma.product.findMany({ where: { ativo: true } }),
      this.prisma.combo.findMany({ where: { ativo: true } }),
      this.prisma.storeConfig.findUnique({ where: { id: 'default' } }),
      this.prisma.deliveryZone.findMany(),
    ]);

    const prodMap = new Map(products.map((p) => [p.id, p]));
    const comboMap = new Map(combos.map((c) => [c.id, c]));

    const resolvedItems = dto.itens.map((input) => {
      const prod = prodMap.get(input.id);
      if (prod) {
        return {
          itemId: prod.id,
          nome: prod.nome,
          q: input.q,
          preco: prod.preco,
          custo: prod.custo,
          sabor: input.sabor ?? null,
        };
      }
      const combo = comboMap.get(input.id);
      if (combo) {
        const comboCost = combo.itens.reduce((sum, pid) => sum + (prodMap.get(pid)?.custo ?? 0), 0);
        return {
          itemId: combo.id,
          nome: `Combo ${combo.nome}`,
          q: input.q,
          preco: combo.preco,
          custo: Number(comboCost.toFixed(2)),
          sabor: input.sabor ?? null,
        };
      }
      throw new BadRequestException(`Item "${input.id}" não encontrado no cardápio.`);
    });

    const subtotal = Number(
      resolvedItems.reduce((sum, item) => sum + item.preco * item.q, 0).toFixed(2),
    );

    let frete = 0;
    let bairroNome = (dto.bairro ?? '').trim();

    if (!isCounter && dto.canal === 'entrega') {
      if (!config?.entrega) {
        throw new BadRequestException('Entrega está desativada no momento.');
      }
      if (config.pedidoMinimo && subtotal < config.pedidoMinimo) {
        throw new BadRequestException(
          `Pedido mínimo para entrega é R$ ${config.pedidoMinimo.toFixed(2)}.`,
        );
      }
      const target = this.normalizeText(bairroNome)
        .replace(/^(bairro|b\.) /, '')
        .replace(/^18 do forte$/, 'dezoito do forte')
        .replace(/^13 de julho$/, 'treze de julho');

      let matchedZone = null;
      let matchedBairro = null;
      for (const z of zones) {
        const found = z.bairros.find((b) => this.normalizeText(b) === target);
        if (found) {
          matchedZone = z;
          matchedBairro = found;
          break;
        }
      }

      if (!matchedZone || !matchedBairro) {
        throw new BadRequestException('Ainda não entregamos no bairro informado.');
      }

      bairroNome = matchedBairro;
      frete =
        config.freteGratisAcima && subtotal >= config.freteGratisAcima ? 0 : matchedZone.taxa;
    }

    const total = Number((subtotal + frete).toFixed(2));
    return { resolvedItems, subtotal, frete, total, bairroNome };
  }

  async createPublicOrder(dto: CreateOrderDto) {
    if (dto.canal === 'balcao') {
      throw new BadRequestException('Canal balcão requer autenticação da equipe.');
    }

    const { resolvedItems, subtotal, frete, total, bairroNome } = await this.resolveOrderData(
      dto,
      false,
    );

    const created = await this.prisma.order.create({
      data: {
        codigo: this.generateCode(),
        canal: dto.canal as OrderChannel,
        mesa: dto.canal === 'mesa' ? (dto.mesa ?? null) : null,
        nome: (dto.nome ?? '').trim().slice(0, 60),
        telefone: (dto.telefone ?? '').trim().slice(0, 20),
        local: (dto.local ?? '').trim().slice(0, 200),
        bairro: bairroNome,
        quando: (dto.quando ?? 'agora').trim().slice(0, 20),
        pagamento: dto.pagamento,
        obs: (dto.obs ?? '').trim().slice(0, 300),
        subtotal,
        frete,
        total,
        status: OrderStatus.novo,
        itens: {
          create: resolvedItems,
        },
      },
      include: { itens: true },
    });

    const serialized = this.serialize(created);
    this.events.emit({ type: 'order.created', order: serialized });
    // O cliente não recebe o custo dos itens (dado interno).
    return { ...serialized, itens: serialized.itens.map(({ custo: _custo, ...item }) => item) };
  }

  async createCounterSale(dto: CreateOrderDto) {
    const { resolvedItems, subtotal, total } = await this.resolveOrderData(
      { ...dto, canal: 'balcao' },
      true,
    );
    const now = new Date();

    const created = await this.prisma.order.create({
      data: {
        codigo: this.generateCode(),
        canal: OrderChannel.balcao,
        mesa: null,
        nome: (dto.nome ?? '').trim().slice(0, 60),
        telefone: '',
        local: '',
        bairro: '',
        quando: 'agora',
        pagamento: dto.pagamento,
        obs: (dto.obs ?? '').trim().slice(0, 300),
        subtotal,
        frete: 0,
        total,
        status: OrderStatus.entregue,
        criadoEm: now,
        emEntregue: now,
        itens: {
          create: resolvedItems,
        },
      },
      include: { itens: true },
    });

    const serialized = this.serialize(created);
    this.events.emit({ type: 'order.created', order: serialized });
    return serialized;
  }

  async findPublicById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }
    return this.serializePublic(order);
  }

  async listSince(desdeIso?: string) {
    let sinceDate: Date;
    if (desdeIso) {
      const parsed = new Date(desdeIso);
      sinceDate = Number.isNaN(parsed.getTime()) ? this.defaultSinceDate() : parsed;
    } else {
      sinceDate = this.defaultSinceDate();
    }

    const orders = await this.prisma.order.findMany({
      where: { criadoEm: { gte: sinceDate } },
      include: { itens: true },
      orderBy: { criadoEm: 'asc' },
    });

    return orders.map((o) => this.serialize(o));
  }

  private defaultSinceDate(): Date {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    return monthStart < sevenDaysAgo ? monthStart : sevenDaysAgo;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    const now = new Date();
    const data: Partial<Order> = { status };
    if (status === OrderStatus.preparo) data.emPreparo = now;
    if (status === OrderStatus.pronto) data.emPronto = now;
    if (status === OrderStatus.entregue) data.emEntregue = now;
    if (status === OrderStatus.cancelado) data.emCancelado = now;

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: { itens: true },
    });

    const serialized = this.serialize(updated);
    this.events.emit({ type: 'order.updated', order: serialized });
    return serialized;
  }
}

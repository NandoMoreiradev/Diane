import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Sse,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { OrderStatus, Role } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PermissionsGuard, RequirePermission } from '../auth/guard/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { EventsService } from './events.service';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  createPublicOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createPublicOrder(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('orders:read')
  @Get()
  listOrders(@Query('desde') desde?: string) {
    return this.ordersService.listSince(desde);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('counter:sale')
  @Post('counter')
  createCounterSale(@Body() dto: CreateOrderDto) {
    return this.ordersService.createCounterSale(dto);
  }

  @Sse('stream/board')
  async streamBoard(@Query('token') token?: string) {
    if (!token) {
      throw new UnauthorizedException('Token obrigatório para acompanhar o balcão.');
    }
    let user: Awaited<ReturnType<AuthService['verifyAccessToken']>>;
    try {
      user = await this.authService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    if (user.role !== Role.ADMIN && !user.permissions.includes('orders:read')) {
      throw new ForbiddenException('Sem permissão para acompanhar o balcão.');
    }
    return this.eventsService.boardStream();
  }

  @Get(':id')
  getPublicOrder(@Param('id') id: string) {
    return this.ordersService.findPublicById(id);
  }

  @Sse(':id/stream')
  streamOrder(@Param('id') id: string) {
    return this.eventsService.orderStream(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('orders:manage')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto.status as OrderStatus);
  }
}

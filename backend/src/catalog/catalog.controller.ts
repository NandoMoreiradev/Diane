import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PermissionsGuard, RequirePermission } from '../auth/guard/permissions.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogService } from './catalog.service';

class UpdateProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  preco?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  custo?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

class UpdateConfigDto {
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  urlSite?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  abre?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  fecha?: number;

  @IsOptional()
  @IsBoolean()
  entrega?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pedidoMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freteGratisAcima?: number;
}

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getCatalog() {
    return this.catalogService.getPublicCatalog();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('catalog:manage')
  @Get('admin')
  getAdminCatalog() {
    return this.catalogService.getAdminCatalog();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('catalog:manage')
  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('config:manage')
  @Patch('config')
  updateConfig(@Body() dto: UpdateConfigDto) {
    return this.catalogService.updateConfig(dto);
  }
}

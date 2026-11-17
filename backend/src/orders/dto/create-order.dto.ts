import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemInputDto {
  @IsString()
  @MaxLength(60)
  id: string;

  @IsInt()
  @Min(1)
  @Max(100)
  q: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sabor?: string | null;
}

export class CreateOrderDto {
  @IsIn(['mesa', 'retirada', 'entrega', 'balcao'])
  canal: 'mesa' | 'retirada' | 'entrega' | 'balcao';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  mesa?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  local?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  bairro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  quando?: string;

  @IsIn(['Pix', 'Cartão', 'Dinheiro'])
  pagamento: 'Pix' | 'Cartão' | 'Dinheiro';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  obs?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  itens: OrderItemInputDto[];
}

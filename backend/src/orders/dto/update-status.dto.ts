import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['novo', 'preparo', 'pronto', 'entregue', 'cancelado'])
  status: 'novo' | 'preparo' | 'pronto' | 'entregue' | 'cancelado';
}

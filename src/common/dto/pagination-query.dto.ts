import { Type } from 'class-transformer';
import { IsPositive, IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  limit: number;

  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  offset: number;
}

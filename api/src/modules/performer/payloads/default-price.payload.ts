import { IsOptional, IsNumber } from 'class-validator';

export class DefaultPricePayload {
  @IsNumber()
  @IsOptional()
  privateCallPrice: number;

  @IsNumber()
  @IsOptional()
  groupCallPrice: number;
}

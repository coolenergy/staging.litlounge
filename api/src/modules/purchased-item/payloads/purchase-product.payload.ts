import { IsOptional, IsString, IsNumber } from 'class-validator';

export class PurchaseProductsPayload {
  @IsString()
  @IsOptional()
  deliveryAddress: string;

  @IsString()
  @IsOptional()
  postalCode: string;

  @IsNumber()
  @IsOptional()
  quantity: number;
}

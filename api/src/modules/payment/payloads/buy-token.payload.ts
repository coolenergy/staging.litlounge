import { IsOptional, IsString } from 'class-validator';

export class BuyTokensPayload {
  @IsOptional()
  @IsString()
  couponCode: string;
}

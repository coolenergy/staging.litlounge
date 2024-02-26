import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  deliveryStatus: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  shippingCode: string;
}

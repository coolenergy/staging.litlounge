import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentTokenSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  source: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sourceId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  targetId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sellerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  target: string;

  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  shippingStatus: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orderStatus: string;
}

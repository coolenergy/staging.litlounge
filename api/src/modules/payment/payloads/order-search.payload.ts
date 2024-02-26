import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class OrderSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  buyerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sellerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deliveryStatus: string;

  @ApiProperty()
  @IsOptional()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  toDate: Date;
}

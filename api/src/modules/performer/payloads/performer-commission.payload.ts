import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class PerformerCommissionPayload {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  tipCommission: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  privateCallCommission: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  groupCallCommission: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  productCommission: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  albumCommission: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  videoCommission: number;
}

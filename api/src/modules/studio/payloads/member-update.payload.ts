import { ApiProperty } from '@nestjs/swagger';
import {
  // IsNotEmpty,
  IsOptional,
  IsNumber,
  Max,
  Min
} from 'class-validator';

export class UpdateCommissionPayload {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tipCommission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  privateCallCommission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  groupCallCommission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  productCommission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  albumCommission: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  videoCommission: number;
}

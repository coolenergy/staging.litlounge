/* eslint-disable camelcase */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean
} from 'class-validator';

export class TokenPackageUpdatePayload {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  ordering: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  tokens: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pi_code: string;
}

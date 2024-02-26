import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class ProductSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  performerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsOptional()
  publish: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  productId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  type: string;
}

import {
  IsString,
  IsOptional,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GalleryCreatePayload {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSale = false;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  token: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  performerId: string;
}

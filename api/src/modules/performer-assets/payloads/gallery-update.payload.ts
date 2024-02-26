import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GalleryUpdatePayload {
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
  @IsNumber()
  @IsOptional()
  token: number;
}

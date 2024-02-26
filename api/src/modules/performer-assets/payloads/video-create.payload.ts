import {
  IsString, IsOptional, IsIn, IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VideoCreatePayload {
  @ApiProperty()
  @IsOptional()
  title: string;

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
  @IsOptional()
  isSaleVideo: boolean;

  @ApiProperty()
  // @IsNumber()
  @IsOptional()
  token: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  performerId: string;
}

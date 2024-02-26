import {
  IsString,
  IsIn,
  IsOptional,
  IsNotEmpty,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(['play', 'publish'])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  expireDate: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  roomId?: string;
}

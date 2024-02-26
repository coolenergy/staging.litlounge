import {
  IsNotEmpty,
  IsNumber,
  Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenSearchPayload {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  offset: number;

  @ApiProperty()
  @IsNumber()
  @Max(50)
  @IsNotEmpty()
  size: number;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty
} from 'class-validator';

export class ContactPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: any;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject: string;
}

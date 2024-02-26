import {
  IsString,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageCreatePayload } from './message-create.payload';

export class PrivateMessageCreatePayload extends MessageCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recipientId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  recipientType: string;
}

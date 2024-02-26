import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsIn
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PUBLIC_CHAT,
  PRIVATE_CHAT,
  GROUP_CHAT
} from 'src/modules/stream/constant';

export class SendTipsPayload {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  token: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn([PUBLIC_CHAT, PRIVATE_CHAT, GROUP_CHAT])
  roomType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  conversationId: string;
}

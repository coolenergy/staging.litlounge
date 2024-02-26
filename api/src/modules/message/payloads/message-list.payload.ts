import { IsString, IsMongoId, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class MessageListRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsMongoId()
  @IsOptional()
  conversationId: string;
}

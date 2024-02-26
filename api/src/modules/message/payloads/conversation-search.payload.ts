import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchRequest } from 'src/kernel/common';

export class ConversationSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  keyword: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  type: string;
}

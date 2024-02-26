import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type = 'private';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['user', 'performer'])
  source: string;
}

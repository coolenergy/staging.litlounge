import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostMetaPayload {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsOptional()
  value: any;
}

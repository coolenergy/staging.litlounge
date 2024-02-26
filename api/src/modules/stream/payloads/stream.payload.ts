import {
  IsString,
  IsIn,
  IsBoolean,
  IsOptional,
  IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const STREAM_TYPE = ['public', 'group', 'private'];

export class StreamPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(STREAM_TYPE)
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isStreaming: boolean;

  @ApiProperty()
  @IsOptional()
  lastStreamingTime: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  streamingTime: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  totalViewer: number;
}

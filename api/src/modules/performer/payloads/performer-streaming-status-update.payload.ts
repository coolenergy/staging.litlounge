import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PerformerStreamingStatusUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;
}

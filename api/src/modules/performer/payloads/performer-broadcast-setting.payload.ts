import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class PerformerBroadcastSetting {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maxParticipantsAllowed: number;
}

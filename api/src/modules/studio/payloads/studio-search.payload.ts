import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel';
import { STUDIO_STATUES } from '../constants';

export class StudioSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  studioId: string;

  @ApiProperty()
  @IsString()
  @IsIn([
    STUDIO_STATUES.ACTIVE,
    STUDIO_STATUES.INACTIVE,
    STUDIO_STATUES.PENDING
  ])
  @IsOptional()
  status: string;
}

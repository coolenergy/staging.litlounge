import { IsString, IsOptional } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';
import { ApiProperty } from '@nestjs/swagger';

export class BannerSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  status: string;
}

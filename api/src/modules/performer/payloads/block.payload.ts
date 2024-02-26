import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockSettingPayload {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  countries: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds: string[];
}

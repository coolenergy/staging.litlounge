import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BANNER_POSITION, BANNER_TYPE } from '../constants';

export class BannerUpdatePayload {
  @ApiProperty()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  href: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(BANNER_POSITION)
  position: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fileId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([BANNER_TYPE.IMG, BANNER_TYPE.HTML])
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contentHTML: string;
}

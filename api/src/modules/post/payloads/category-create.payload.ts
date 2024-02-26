import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreatePayload {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  type = 'post';

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  parentId: string;
}

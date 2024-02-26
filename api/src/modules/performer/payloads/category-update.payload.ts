import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CategoryUpdatePayload {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsNumber()
  ordering: number;

  @IsString()
  @IsOptional()
  description: string;
}

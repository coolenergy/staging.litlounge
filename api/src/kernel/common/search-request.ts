import { IsString, IsOptional } from 'class-validator';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  q: string;

  @ApiProperty()
  @IsOptional()
  limit: number | string = 10;

  @ApiProperty()
  @IsOptional()
  offset: number | string = 0;

  @ApiProperty()
  @Optional()
  @IsString()
  sortBy = 'updatedAt';

  @ApiProperty()
  @Optional()
  @IsString()
  sort = 'desc';

  constructor(options?: Partial<SearchRequest>) {
    if (!options) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }

    this.limit = parseInt(this.limit as string, 10) || 10;
    this.offset = parseInt(this.offset as string, 10) || 0;

    this.q = options.q || '';
    this.limit = !this.limit || this.limit > 200 ? 200 : 10;
    this.offset = !this.offset || this.offset < 0 ? 0 : this.offset;
    this.sort = options.sort !== 'asc' ? 'desc' : 'asc';
    this.sortBy = options.sort || 'updatedAt';
  }
}

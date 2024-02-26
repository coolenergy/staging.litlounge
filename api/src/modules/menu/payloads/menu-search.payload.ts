import { SearchRequest } from 'src/kernel/common';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MENU_SECTION } from '../constants';

export class MenuSearchRequestPayload extends SearchRequest {
  title?: string;

  public?: boolean;

  internal?: boolean;

  @ApiProperty()
  @IsString()
  @IsIn([MENU_SECTION.MAIN, MENU_SECTION.HEADER, MENU_SECTION.FOOTER])
  @IsOptional()
  section: string;
}

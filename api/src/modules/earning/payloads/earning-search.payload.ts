import { SearchRequest } from 'src/kernel/common';
import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsBoolean,
  IsISO8601
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { PURCHASE_ITEM_TYPE } from 'src/modules/purchased-item/constants';

export class EarningSearchRequestPayload extends SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  performerType: string;
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  performerId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sourceId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  targetId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  studioId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn([
    PURCHASE_ITEM_TYPE.GROUP,
    PURCHASE_ITEM_TYPE.PHOTO,
    PURCHASE_ITEM_TYPE.PRIVATE,
    PURCHASE_ITEM_TYPE.PRODUCT,
    PURCHASE_ITEM_TYPE.SALE_VIDEO,
    PURCHASE_ITEM_TYPE.TIP
  ])
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['performer', 'studio', 'user'])
  source: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsIn(['performer', 'studio', 'user'])
  target: string;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  fromDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsISO8601()
  toDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  paidAt: Date;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  payoutStatus: string;
}

export interface UpdateEarningStatusPayload {
  targetId: ObjectId;
  fromDate: Date;
  toDate: Date;
}

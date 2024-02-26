import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsISO8601
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchRequest } from 'src/kernel/common';
import { STATUES, SOURCE_TYPE } from '../constants';

export class PayoutRequestCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentAccountType: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([SOURCE_TYPE.PERFORMER, SOURCE_TYPE.STUDIO])
  sourceType: string;

  @ApiProperty()
  @IsNotEmpty()
  fromDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  toDate: Date;

  @ApiProperty()
  @IsOptional()
  requestNote: string;
}

export class PayoutRequestUpdatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([STATUES.PENDING, STATUES.REJECTED, STATUES.DONE, STATUES.APPROVED])
  status: string;

  @ApiProperty()
  @IsOptional()
  adminNote: string;
}

export class PayoutRequestSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  performerId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  studioId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sourceId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  paymentAccountType?: string;

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
  @IsString()
  status: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sourceType: string;
}

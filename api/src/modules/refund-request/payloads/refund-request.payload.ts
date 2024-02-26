import {
  IsString, IsOptional, IsNotEmpty, IsNumber, Min, IsIn
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { SearchRequest } from 'src/kernel/common';
import { STATUES } from '../constants';

export class RefundRequestCreatePayload {
  @ApiProperty()
  @IsString()
  sourceType = 'order';

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sourceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  performerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  token: number;
}

export class RefundRequestUpdatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([STATUES.PENDING, STATUES.REJECTED, STATUES.RESOLVED])
  status: string;
}

export class RefundRequestSearchPayload extends SearchRequest {
  performerId?: string | ObjectId;

  userId?: string | ObjectId;

  sourceId?: string | ObjectId;

  sourceType?: string;

  fromDate?: string | Date;

  toDate?: string | Date;

  status?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel';
import { BANKING_TYPE } from '../constants';

export class PaymentInformationPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn([
    BANKING_TYPE.BITPAY,
    BANKING_TYPE.DEPOSIT,
    BANKING_TYPE.ISSUE,
    BANKING_TYPE.PAYONNEER,
    BANKING_TYPE.PAYPAL,
    BANKING_TYPE.WIRE,
    BANKING_TYPE.PAXUM
  ])
  type: string;
}

export class AdminCreatePaymentInformationPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn([
    BANKING_TYPE.BITPAY,
    BANKING_TYPE.DEPOSIT,
    BANKING_TYPE.ISSUE,
    BANKING_TYPE.PAYONNEER,
    BANKING_TYPE.PAYPAL,
    BANKING_TYPE.WIRE,
    BANKING_TYPE.PAXUM
  ])
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sourceType: string;
}

export class AdminSearchPaymentInformationPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([
    BANKING_TYPE.BITPAY,
    BANKING_TYPE.DEPOSIT,
    BANKING_TYPE.ISSUE,
    BANKING_TYPE.PAYONNEER,
    BANKING_TYPE.PAYPAL,
    BANKING_TYPE.WIRE,
    BANKING_TYPE.PAXUM
  ])
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sourceId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sourceType: string;
}

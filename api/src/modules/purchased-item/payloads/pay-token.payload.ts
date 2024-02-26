import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { PURCHASE_ITEM_TYPE } from '../constants';

export class PayTokenPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([PURCHASE_ITEM_TYPE.GROUP, PURCHASE_ITEM_TYPE.PRIVATE])
  type: string;
}

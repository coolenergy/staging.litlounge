import {
  Injectable,
  Post,
  HttpCode,
  HttpStatus,
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  Body
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { Roles, CurrentUser } from 'src/modules/auth/decorators';
import { DataResponse } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { SendTipsPayload } from '../payloads';
import { PurchaseItemService } from '../services';

@Injectable()
@Controller('member')
export class MemberPaymentToken {
  constructor(private readonly paymentService: PurchaseItemService) {}

  @Post('/send-tip-token/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendTips(
    @CurrentUser() user: UserDto,
    @Param('id') id: string,
    @Body() payload: SendTipsPayload
  ): Promise<DataResponse<any>> {
    const data = await this.paymentService.sendTips(user, id, payload);
    return DataResponse.ok(data);
  }

  @Post('/send-pay-token/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendPaidToken(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const info = await this.paymentService.sendPaidToken(user, id);
    return DataResponse.ok(info);
  }
}

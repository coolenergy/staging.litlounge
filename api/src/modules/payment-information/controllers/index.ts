import {
  Body,
  Query,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param
} from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';
import { PaymentInformationPayload, AdminCreatePaymentInformationPayload, AdminSearchPaymentInformationPayload } from '../payloads';
import { PaymentInformationService } from '../services';
import { PaymentInformationModel } from '../models';

@Controller('payment-information')
export class PaymentInformationController {
  constructor(
    private readonly paymentInformationService: PaymentInformationService
  ) {}

  @Post('')
  @Roles('performer', 'studio')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() user,
    @Body() payload: PaymentInformationPayload
  ): Promise<DataResponse<LeanDocument<PaymentInformationModel>>> {
    const result = await this.paymentInformationService.create(payload, user);
    return DataResponse.ok(result);
  }

  @Get('')
  @Roles('performer', 'studio')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async get(
    @CurrentUser() user,
    @Query() payload: PaymentInformationPayload
  ): Promise<DataResponse<LeanDocument<PaymentInformationModel>>> {
    const result = await this.paymentInformationService.detail(payload, user);
    return DataResponse.ok(result);
  }

  @Get('/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminGet(@Param('id') id: string) {
    const result = await this.paymentInformationService.adminDetail(id);
    return DataResponse.ok(result);
  }

  @Post('/create')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminUpdate(
    @CurrentUser() user,
    @Body() payload: AdminCreatePaymentInformationPayload
  ): Promise<DataResponse<LeanDocument<PaymentInformationModel>>> {
    const result = await this.paymentInformationService.adminCreate(payload);
    return DataResponse.ok(result);
  }

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @CurrentUser() user,
    @Query() payload: AdminSearchPaymentInformationPayload
  ): Promise<DataResponse<PageableData<any>>> {
    const result = await this.paymentInformationService.adminSearch(payload);
    return DataResponse.ok(result);
  }
}

/* eslint-disable camelcase */
import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  Get,
  Param,
  ForbiddenException,
  Put,
  Body
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from '../../user/dtos';
import { OrderSearchPayload } from '../payloads';
import { OrderSearchService } from '../services/order-search.service';
import { OrderService } from '../services';
import { OrderUpdatePayload } from '../payloads/order-update.payload';

@Injectable()
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderSearchService: OrderSearchService,
    private readonly orderService: OrderService
  ) {}

  @Get('/user/details/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userGetOrderDetails(
    @Param('id') orderId: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const item = await this.orderService.findById(orderId);
    if (item?.buyerId?.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    const response = await this.orderService.getDetails(orderId);
    return DataResponse.ok(response);
  }

  @Get('/details/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrderDetails(
    @Param('id') orderId: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const item = await this.orderService.findById(orderId);
    if (!user.roles?.includes('admin') && item?.sellerId?.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }

    const response = await this.orderService.getDetails(orderId);
    return DataResponse.ok(response);
  }

  @Get('/user/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserOrders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    req.buyerId = user._id as any;
    const response = await this.orderSearchService.search(req);
    return DataResponse.ok(response);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    if (!user.roles?.includes('admin')) {
      req.sellerId = user._id as any;
    }
    const response = await this.orderSearchService.search(req);
    return DataResponse.ok(response);
  }

  @Put('/:id/update')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') orderId: string,
    @Body() payload: OrderUpdatePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const item = await this.orderService.findById(orderId);
    if (!user.roles?.includes('admin') && item?.sellerId?.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    const response = await this.orderService.update(orderId, payload);
    return DataResponse.ok(response);
  }
}

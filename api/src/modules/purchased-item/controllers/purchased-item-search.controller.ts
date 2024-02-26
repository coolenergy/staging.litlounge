import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { Roles, CurrentUser } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { PurchasedItemSearchService } from '../services';
import { PaymentTokenSearchPayload } from '../payloads/purchase-item.search.payload';
import { PurchasedItemDto } from '../dtos';
import { PURCHASE_ITEM_TYPE } from '../constants';

@Injectable()
@Controller('purchased-items')
export class PaymentTokenSearchController {
  constructor(
    private readonly purchasedItemSearchService: PurchasedItemSearchService
  ) {}

  @Get('/admin/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminTranasctions(
    @Query() req: PaymentTokenSearchPayload
  ): Promise<DataResponse<PageableData<PurchasedItemDto>>> {
    const data = await this.purchasedItemSearchService.adminGetUserTransactionsToken(
      req
    );
    return DataResponse.ok(data);
  }

  @Get('/user/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userTranasctions(
    @Query() req: PaymentTokenSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PurchasedItemDto>>> {
    const data = await this.purchasedItemSearchService.getUserTransactionsToken(
      req,
      user
    );
    return DataResponse.ok(data);
  }

  @Get('/user/videos')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPurchasedVideos(
    @Query() req: PaymentTokenSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PurchasedItemDto>>> {
    req.type = PURCHASE_ITEM_TYPE.SALE_VIDEO;
    const data = await this.purchasedItemSearchService.getUserTransactionsToken(
      req,
      user
    );
    return DataResponse.ok(data);
  }

  @Get('/user/galleries')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPurchasedGalleries(
    @Query() req: PaymentTokenSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PurchasedItemDto>>> {
    req.type = PURCHASE_ITEM_TYPE.PHOTO;
    const data = await this.purchasedItemSearchService.getUserTransactionsToken(
      req,
      user
    );
    return DataResponse.ok(data);
  }

  @Get('/user/products')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPurchasedProducts(
    @Query() req: PaymentTokenSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<PurchasedItemDto>>> {
    req.type = PURCHASE_ITEM_TYPE.PRODUCT;
    const data = await this.purchasedItemSearchService.getUserTransactionsToken(
      req,
      user
    );
    return DataResponse.ok(data);
  }
}

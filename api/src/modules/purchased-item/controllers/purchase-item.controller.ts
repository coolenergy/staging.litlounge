import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Post,
  Body,
  Param
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { ObjectId } from 'mongodb';
import { PurchaseProductsPayload } from '../payloads';
import { UserDto } from '../../user/dtos';
import { PurchaseItemService } from '../services/purchase-item.service';

@Injectable()
@Controller('purchase-items')
export class PaymentTokenController {
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  @Post('/product/:productId')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseProduct(
    @CurrentUser() user: UserDto,
    @Param('productId') productId: string | ObjectId,
    @Body() payload: PurchaseProductsPayload
  ): Promise<DataResponse<any>> {
    const info = await this.purchaseItemService.purchaseProduct(
      productId,
      user,
      payload
    );
    return DataResponse.ok(info);
  }

  @Post('/video/:videoId')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseVideo(
    @CurrentUser() user: UserDto,
    @Param('videoId') videoId: string | ObjectId
  ): Promise<DataResponse<any>> {
    const info = await this.purchaseItemService.purchaseVideo(videoId, user);
    return DataResponse.ok(info);
  }

  @Post('/gallery/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async buyPhoto(
    @CurrentUser() user: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const info = await this.purchaseItemService.buyPhotoGallery(id, user);
    return DataResponse.ok(info);
  }
}

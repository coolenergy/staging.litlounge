import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Res,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { Response, Request as Req } from 'express';
import { DataResponse } from 'src/kernel';
import { AuthService } from 'src/modules/auth/services';
import { CurrentUser } from 'src/modules/auth/decorators';
import { UserInterceptor } from 'src/modules/auth/interceptors';
import { UserDto } from 'src/modules/user/dtos';
import { AuthGuard } from 'src/modules/auth/guards';
import { FileService } from 'src/modules/file/services';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { PURCHASE_ITEM_TYPE } from 'src/modules/purchased-item/constants';
import { ProductService } from '../services/product.service';
import { ProductSearchService } from '../services/product-search.service';
import { ProductSearchRequest } from '../payloads';
import { PRODUCT_TYPE } from '../constants';

@Injectable()
@Controller('user/performer-assets/products')
export class UserProductsController {
  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly productSearchService: ProductSearchService,
    private readonly fileService: FileService,
    private readonly paymentTokenService: PaymentTokenService
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: ProductSearchRequest,
    @CurrentUser() user: UserDto
  ) {
    const resp = await this.productSearchService.userSearch(req, user);
    const data = resp.data.map((d) => d.toPublic());
    return DataResponse.ok({
      data,
      total: resp.total
    });
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async details(@Param('id') id: string) {
    const details = await this.productService.getDetails(id);
    // TODO - filter here
    return DataResponse.ok(details.toPublic());
  }

  @Get('/:id/download-link')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDownloadLink(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ) {
    const product = await this.productService.findById(id);
    if (!product || product.type !== PRODUCT_TYPE.DIGITAL) {
      throw new BadRequestException('Invalid product');
    }
    const bought = await this.paymentTokenService.checkBought(product._id, PURCHASE_ITEM_TYPE.PRODUCT as any, user);
    if (!bought) {
      throw new BadRequestException('Please purchase this product product');
    }

    const downloadUrl = await this.fileService.generateDownloadLink(product.digitalFileId);
    return DataResponse.ok({
      downloadUrl
    });
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() request: Req,
    @Res() response: Response
  ) {
    if (!request.query.token) return response.status(HttpStatus.UNAUTHORIZED).send();
    const user = await this.authService.getSourceFromJWT(request.query.token as string);
    if (!user) {
      return response.status(HttpStatus.UNAUTHORIZED).send();
    }
    const valid = await this.productService.checkAuth(request, user);
    return response.status(valid ? HttpStatus.OK : HttpStatus.UNAUTHORIZED).send();
  }
}

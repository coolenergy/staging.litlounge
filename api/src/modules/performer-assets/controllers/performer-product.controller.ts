import {
  Controller,
  Injectable,
  UseGuards,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Put,
  Get,
  Param,
  Query,
  UseInterceptors,
  Delete,
  Request
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig } from 'src/kernel';
import { Roles, CurrentUser } from 'src/modules/auth/decorators';
import { MultiFileUploadInterceptor, FilesUploaded } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { ProductService } from '../services/product.service';
import { ProductCreatePayload, ProductSearchRequest } from '../payloads';
import { ProductSearchService } from '../services/product-search.service';

@Injectable()
@Controller('performer/performer-assets/products')
export class PerformerProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSearchService: ProductSearchService
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'performer-product-image',
        fieldName: 'image',
        options: {
          destination: getConfig('file').imageDir,
          generateThumbnail: true,
          replaceWithThumbail: true,
          thumbnailSize: getConfig('image').productThumbnail
        }
      },
      {
        type: 'performer-product-digital',
        fieldName: 'digitalFile',
        options: {
          destination: getConfig('file').digitalProductDir
        }
      }
    ])
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: ProductCreatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.productService.create(
      payload,
      files.digitalFile,
      files.image,
      creator
    );
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'performer-product-image',
        fieldName: 'image',
        options: {
          destination: getConfig('file').imageDir,
          generateThumbnail: true,
          replaceWithThumbail: true,
          thumbnailSize: getConfig('image').productThumbnail
        }
      },
      {
        type: 'performer-product-digital',
        fieldName: 'digitalFile',
        options: {
          destination: getConfig('file').digitalProductDir
        }
      }
    ])
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: ProductCreatePayload,
    @CurrentUser() updater: UserDto
  ): Promise<any> {
    const resp = await this.productService.update(
      id,
      payload,
      files.digitalFile,
      files.image,
      updater
    );
    return DataResponse.ok(resp);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string): Promise<any> {
    const resp = await this.productService.delete(id);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async details(@Param('id') id: string, @Request() request: any): Promise<any> {
    const resp = await this.productService.performerGetDetails(id, request.jwToken);
    return DataResponse.ok(resp);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async search(
    @Query() req: ProductSearchRequest,
    @CurrentUser() user: UserDto,
    @Request() request: any
  ): Promise<any> {
    const resp = await this.productSearchService.performerSearch(req, user, request.jwToken);
    return DataResponse.ok(resp);
  }

  @Get('/user-search')
  @HttpCode(HttpStatus.OK)
  async userSearch(@Query() req: ProductSearchRequest): Promise<any> {
    const resp = await this.productSearchService.userSearch(req);
    return DataResponse.ok(resp);
  }
}

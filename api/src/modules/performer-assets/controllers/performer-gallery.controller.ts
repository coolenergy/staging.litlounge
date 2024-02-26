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
  Param,
  Get,
  Query,
  Delete,
  Request
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { GalleryCreatePayload, GallerySearchRequest } from '../payloads';
import { GalleryService } from '../services/gallery.service';
import { GalleryUpdatePayload } from '../payloads/gallery-update.payload';

@Injectable()
@Controller('performer/performer-assets/galleries')
export class PerformerGalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGallery(@Body() payload: GalleryCreatePayload, @CurrentUser() creator: UserDto): Promise<any> {
    const resp = await this.galleryService.create(payload, creator);
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGallery(
    @Param('id') id: string,
    @Body() payload: GalleryUpdatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.galleryService.update(id, payload, creator);
    return DataResponse.ok(resp);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchGallery(
    @Query() req: GallerySearchRequest,
    @CurrentUser() user: UserDto,
    @Request() request: any
  ): Promise<any> {
    const resp = await this.galleryService.performerSearch(req, user, request.jwToken);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async view(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
    ): Promise<any> {
    const resp = await this.galleryService.details(id, user);
    return DataResponse.ok(resp);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string) {
    const details = await this.galleryService.delete(id);
    return DataResponse.ok(details);
  }
}

import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Query,
  UseInterceptors,
  Request
} from '@nestjs/common';
import { UserInterceptor } from 'src/modules/auth/interceptors';
import { DataResponse } from 'src/kernel';
import { AuthService } from 'src/modules/auth/services';
import { CurrentUser } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { GalleryService } from '../services/gallery.service';
import { GallerySearchRequest } from '../payloads';

@Injectable()
@Controller('user/performer-assets/galleries')
export class UserGalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly authService: AuthService
    ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchGallery(
    @Query() req: GallerySearchRequest,
    @CurrentUser() user: UserDto,
    @Request() request: any
  ): Promise<any> {
    const auth = request.authUser && { _id: request.authUser.authId, source: request.authUser.source, sourceId: request.authUser.sourceId };
    const jwToken = request.authUser && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const resp = await this.galleryService.userSearch(req, user, jwToken);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async view(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
   ): Promise<any> {
    const resp = await this.galleryService.details(id, user);
    return DataResponse.ok(resp);
  }
}

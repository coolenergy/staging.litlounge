import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseInterceptors,
  Param,
  Request,
  Res
} from '@nestjs/common';
import { Response, Request as Req } from 'express';
import { DataResponse, SearchRequest } from 'src/kernel';
import { AuthService } from 'src/modules/auth/services';
import { CurrentUser } from 'src/modules/auth/decorators';
import { UserInterceptor } from 'src/modules/auth/interceptors';
import { UserDto } from 'src/modules/user/dtos';
import { PhotoService } from '../services';
import { PhotoSearchService } from '../services/photo-search.service';

@Injectable()
@Controller('user/performer-assets/photos')
export class UserPhotosController {
  constructor(
    private readonly photoSearchService: PhotoSearchService,
    private readonly photoService: PhotoService,
    private readonly authService: AuthService
    ) {}

  @Get('/:galleryId/search')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UserInterceptor)
  async list(
    @Param('galleryId') id: string,
    @Query() req: SearchRequest,
    @CurrentUser() user: UserDto,
    @Request() request: any
  ) {
    const auth = request.authUser && { _id: request.authUser.authId, source: request.authUser.source, sourceId: request.authUser.sourceId };
    const jwToken = request.authUser && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    // TODO - filter for subscriber
    const data = await this.photoSearchService.userSearch(id, req, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() request: Req,
    @Res() response: Response
  ) {
    if (!request.query.galleryId) {
      return response.status(HttpStatus.UNAUTHORIZED).send()
    }

    const valid = await this.photoService.checkAuth(request);
    return response.status(valid ? HttpStatus.OK : HttpStatus.UNAUTHORIZED).send();
  }
}

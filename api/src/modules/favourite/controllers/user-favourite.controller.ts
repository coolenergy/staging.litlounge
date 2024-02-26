import {
  Get,
  Post,
  Controller,
  Injectable,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { DataResponse, PageableData } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { FavouriteService } from '../services';
import { FavouriteSearchPayload } from '../payload';
import { FavouriteDto } from '../dtos';

@Injectable()
@Controller('favourite')
export class UserFavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post('/:id/like')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  async like(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.favouriteService.doLike(id, user._id);
    return DataResponse.ok(data);
  }

  @Post('/:id/unlike')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  async unlike(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const data = await this.favouriteService.doUnlike(id, user._id);
    return DataResponse.ok(data);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  async userSearch(
    @Query() req: FavouriteSearchPayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<PageableData<FavouriteDto>>> {
    const data = await this.favouriteService.userSearch(req, user);
    return DataResponse.ok(data);
  }
}

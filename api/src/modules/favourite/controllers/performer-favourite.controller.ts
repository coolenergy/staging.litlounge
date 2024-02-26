import {
  Get,
  Controller,
  Injectable,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { PerformerDto } from 'src/modules/performer/dtos';
import { DataResponse, PageableData } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { FavouriteService } from '../services';
import { FavouriteSearchPayload } from '../payload';
import { FavouriteDto } from '../dtos';

@Injectable()
@Controller('performer/favourite')
export class PerformerFavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  async performerSearch(
    @Query() req: FavouriteSearchPayload,
    @CurrentUser() user: PerformerDto
  ): Promise<DataResponse<PageableData<FavouriteDto>>> {
    const data = await this.favouriteService.performerSearch(req, user);
    return DataResponse.ok(data);
  }
}

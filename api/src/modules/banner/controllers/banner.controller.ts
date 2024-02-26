import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Query
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { BannerSearchRequest } from '../payloads';
import { BannerSearchService } from '../services';

@Injectable()
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerSearchService: BannerSearchService) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() req: BannerSearchRequest) {
    const list = await this.bannerSearchService.search(req);
    return DataResponse.ok(list);
  }
}

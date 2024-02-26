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
  Delete,
  Get,
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, PageableData } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { TokenPackageService, TokenPackageSearchService } from '../services';
import {
  TokenPackageCreatePayload,
  TokenPackageSearchPayload,
  TokenPackageUpdatePayload
} from '../payloads';
import { ITokenPackage, TokenPackageDto } from '../dtos';

@Injectable()
@Controller('admin/package')
export class AdminTokenPackageController {
  constructor(
    private readonly tokenPackageService: TokenPackageService,
    private readonly tokenPackageSearchService: TokenPackageSearchService
  ) {}

  @Post('/token')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: TokenPackageCreatePayload
  ): Promise<DataResponse<ITokenPackage>> {
    const tokenPackage = await this.tokenPackageService.create(payload);
    return DataResponse.ok(new TokenPackageDto(tokenPackage).toResponse());
  }

  @Put('/token/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Body() payload: TokenPackageUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<ITokenPackage>> {
    const tokenPackage = await this.tokenPackageService.update(id, payload);
    return DataResponse.ok(new TokenPackageDto(tokenPackage).toResponse());
  }

  @Get('/token/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async details(@Param('id') id: string): Promise<DataResponse<ITokenPackage>> {
    const tokenPackage = await this.tokenPackageService.findById(id);
    return DataResponse.ok(new TokenPackageDto(tokenPackage).toResponse());
  }

  @Delete('/token/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: string): Promise<DataResponse<boolean>> {
    await this.tokenPackageService.delete(id);
    return DataResponse.ok(true);
  }

  @Get('/token/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: TokenPackageSearchPayload
  ): Promise<DataResponse<PageableData<ITokenPackage>>> {
    const data = await this.tokenPackageSearchService.search(req);
    return DataResponse.ok({
      total: data.total,
      data: data.data.map((p) => new TokenPackageDto(p).toResponse())
    });
  }
}

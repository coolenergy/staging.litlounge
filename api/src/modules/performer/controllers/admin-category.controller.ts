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
import { DataResponse, EntityNotFoundException, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { CategoryService, CategorySearchService } from '../services';
import {
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategorySearchRequestPayload
} from '../payloads';
import { PerformerCategoryDto } from '../dtos';

@Injectable()
@Controller('admin/performer-categories')
export class AdminCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySearchService: CategorySearchService
  ) {}

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: CategoryCreatePayload
  ): Promise<DataResponse<PerformerCategoryDto>> {
    const category = await this.categoryService.create(payload, currentUser);
    return DataResponse.ok(new PerformerCategoryDto(category));
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDto,
    @Body() payload: CategoryUpdatePayload
  ): Promise<DataResponse<PerformerCategoryDto>> {
    const category = await this.categoryService.update(
      id,
      payload,
      currentUser
    );
    return DataResponse.ok(new PerformerCategoryDto(category));
  }

  @Delete('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: string): Promise<DataResponse<boolean>> {
    await this.categoryService.delete(id);
    return DataResponse.ok(true);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: CategorySearchRequestPayload
  ): Promise<DataResponse<PageableData<PerformerCategoryDto>>> {
    const category = await this.categorySearchService.search(req);
    return DataResponse.ok(category);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string
  ): Promise<DataResponse<PerformerCategoryDto>> {
    const category = await this.categoryService.findByIdOrSlug(id);
    if (!category) {
      throw new EntityNotFoundException();
    }

    return DataResponse.ok(new PerformerCategoryDto(category));
  }
}

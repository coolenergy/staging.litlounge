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
  Delete
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { CategoryService } from '../services';
import { CategoryCreatePayload, CategoryUpdatePayload } from '../payloads';
import { CategoryModel } from '../models';

@Injectable()
@Controller('admin/post-categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: CategoryCreatePayload
  ): Promise<DataResponse<CategoryModel>> {
    const category = await this.categoryService.create(payload, currentUser);
    return DataResponse.ok(category);
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
  ): Promise<DataResponse<CategoryModel>> {
    const category = await this.categoryService.update(
      id,
      payload,
      currentUser
    );
    return DataResponse.ok(category);
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
}

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
  UseInterceptors,
  Delete,
  Get,
  Query
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { UserDto } from 'src/modules/user/dtos';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { PostCreatePayload, PostUpdatePayload, AdminSearch } from '../payloads';
import { PostModel } from '../models';
import { PostService, PostSearchService } from '../services';

@Injectable()
@Controller('admin/posts')
export class AdminPostController {
  constructor(
    private readonly postService: PostService,
    private readonly postSearchService: PostSearchService
  ) {}

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PostCreatePayload
  ): Promise<DataResponse<PostModel>> {
    const post = await this.postService.create(payload, currentUser);
    return DataResponse.ok(post);
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PostUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<PostModel>> {
    const post = await this.postService.update(id, payload, currentUser);
    return DataResponse.ok(post);
  }

  @Delete('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PostUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<boolean>> {
    const post = await this.postService.delete(id);
    return DataResponse.ok(post);
  }

  @Post('images/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check mime type?
    FileUploadInterceptor('image', 'image', {
      destination: getConfig('file').imageDir
      // TODO - define rule of
    })
  )
  async uploadImage(
    @CurrentUser() user: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    return DataResponse.ok({
      success: true,
      ...file,
      url: file.getUrl()
    });
  }

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @CurrentUser() currentUser: UserDto,
    @Query() req: AdminSearch
  ): Promise<DataResponse<PageableData<PostModel>>> {
    const post = await this.postSearchService.adminSearch(req);
    return DataResponse.ok(post);
  }

  @Get('/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminGetDetails(
    @CurrentUser() currentUser: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const post = await this.postService.adminGetDetails(id);
    return DataResponse.ok(post);
  }
}

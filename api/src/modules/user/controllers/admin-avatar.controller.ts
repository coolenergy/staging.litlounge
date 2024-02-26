import {
  HttpCode,
  HttpStatus,
  Controller,
  Injectable,
  UseGuards,
  Post,
  UseInterceptors,
  Param
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig, EntityNotFoundException } from 'src/kernel';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { Roles } from 'src/modules/auth/decorators';
import { UserDto } from '../dtos';
import { UserService } from '../services';

@Injectable()
@Controller('admin/users')
export class AdminAvatarController {
  static avatarDir: string;

  constructor(private readonly userService: UserService) {}

  @Post('/:id/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').avatar
      // TODO - check option fir resize, etc...
    })
  )
  async uploadUserAvatar(
    @Param('id') userId: string,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new EntityNotFoundException();
    }
    await this.userService.updateAvatar(new UserDto(user), file);
    return DataResponse.ok({
      success: true,
      url: file.getUrl()
    });
  }
}

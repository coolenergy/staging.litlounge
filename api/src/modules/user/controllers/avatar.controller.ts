import {
  HttpCode,
  HttpStatus,
  Controller,
  Injectable,
  UseGuards,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig } from 'src/kernel';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { CurrentUser } from 'src/modules/auth/decorators';
import { UserDto } from '../dtos';
import { UserService } from '../services';

@Injectable()
@Controller('users')
export class AvatarController {
  static avatarDir: string;

  constructor(private readonly userService: UserService) {}

  @Post('/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      generateThumbnail: true,
      replaceWithThumbail: true,
      thumbnailSize: getConfig('image').avatar
      // TODO - check option fir resize, etc...
    })
  )
  async uploadAvatar(
    @CurrentUser() user: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.userService.updateAvatar(user, file);
    return DataResponse.ok({
      success: true,
      url: file.getUrl()
    });
  }
}

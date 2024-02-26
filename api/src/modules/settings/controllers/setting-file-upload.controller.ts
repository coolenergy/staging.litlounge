import {
  HttpCode,
  HttpStatus,
  Controller,
  Injectable,
  UseGuards,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse, getConfig } from 'src/kernel';
import { FileUploadInterceptor, FileUploaded, FileDto } from 'src/modules/file';
import { Roles } from 'src/modules/auth/decorators';

@Injectable()
@Controller('admin/settings/files')
export class SettingFileUploadController {
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('setting', 'file', {
      destination: getConfig('file').settingDir
    })
  )
  async uploadFile(@FileUploaded() file: FileDto): Promise<any> {
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }
}

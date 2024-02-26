import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Query,
  Res
} from '@nestjs/common';
import { FileService } from '../services';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService
  ) { }

  @Get('download')
  @HttpCode(HttpStatus.OK)
  public async downloadFile(
    @Res() response: any,
    @Query('key') key: string
  ): Promise<any> {
    const info = await this.fileService.getStreamToDownload(key);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${info.file.name}`
    );

    info.stream.pipe(response);
  }
}

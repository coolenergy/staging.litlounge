import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  UseGuards,
  Body,
  Put,
  Param
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { SettingService } from '../services';
import { SettingDto } from '../dtos';
import { RoleGuard } from '../../auth/guards';
import { SettingUpdatePayload } from '../payloads';

@Injectable()
@Controller('admin/settings')
export class AdminSettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getAdminSettings(
    @Query('group') group: string
  ): Promise<DataResponse<SettingDto[]>> {
    const settings = await this.settingService.getEditableSettings(group);
    return DataResponse.ok(settings);
  }

  @Get('/:key')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getKeyValueSettings(
    @Param('key') key: string
  ): Promise<DataResponse<string>> {
    const value = await this.settingService.getKeyValue(key);
    return DataResponse.ok(value);
  }

  @Put('/:key')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async update(
    @Param('key') key: string,
    @Body() value: SettingUpdatePayload
  ): Promise<DataResponse<SettingDto>> {
    const data = await this.settingService.update(key, value);
    return DataResponse.ok(data);
  }
}

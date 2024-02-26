import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get
} from '@nestjs/common';
import { CurrentUser, Roles } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';
import { DataResponse } from 'src/kernel';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { PerformerCommissionService } from 'src/modules/performer/services';
import {
  PerformerCommissionDto,
  PerformerDto
} from 'src/modules/performer/dtos';
import { IStudio } from 'src/modules/studio/dtos';
import { SettingService } from '../services';

@Injectable()
@Controller('settings')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly performerCommission: PerformerCommissionService
  ) {}

  @Get('/public')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPublicSettings(): Promise<DataResponse<Record<string, any>>> {
    const data = await this.settingService.getPublicSettings();
    return DataResponse.ok(data);
  }

  @Get('/performer/commission')
  @Roles('performer')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async getPerformerCommission(
    @CurrentUser() performer: PerformerDto
  ): Promise<DataResponse<any>> {
    const performerCommission = await this.performerCommission.findOne({ performerId: performer._id });

    if (performerCommission) {
      return DataResponse.ok(new PerformerCommissionDto(performerCommission));
    }

    const defaultCommission = await this.settingService.getKeyValue(SETTING_KEYS.PERFORMER_COMMISSION);

    return DataResponse.ok({
      albumCommission: defaultCommission,
      groupCallCommission: defaultCommission,
      memberCommission: defaultCommission,
      privateCallCommission: defaultCommission,
      productCommission: defaultCommission,
      studioCommission: defaultCommission,
      tipCommission: defaultCommission,
      videoCommission: defaultCommission
    });
  }

  @Get('/studio/commission')
  @Roles('studio')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async getStudioCommission(
    @CurrentUser() studio: IStudio
  ): Promise<DataResponse<any>> {
    const defaultCommission = await this.settingService.getKeyValue(
      SETTING_KEYS.STUDIO_COMMISSION
    );
    return DataResponse.ok(
      typeof studio.commission === 'number'
        ? studio.commission
        : defaultCommission
    );
  }
}

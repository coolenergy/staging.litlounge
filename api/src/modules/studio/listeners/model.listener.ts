import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { FileService } from 'src/modules/file/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { STUDIO_CHANNEL, STUDIO_EVENT_NAME } from '../constants';
import { StudioModel } from '../models';
import { STUDIO_MODEL_PROVIDER } from '../providers';
import { StudioService } from '../services';

@Injectable()
export class ModelListener {
  constructor(
    @Inject(STUDIO_MODEL_PROVIDER)
    private readonly studioModel: Model<StudioModel>,
    private readonly studioService: StudioService,
    private readonly queueEventService: QueueEventService,
    private readonly settingService: SettingService,
    private readonly fileService: FileService
  ) {
    this.queueEventService.subscribe(
      STUDIO_CHANNEL,
      'STUDIO_CREATED',
      this.createStudioHandler.bind(this)
    );
  }

  async createStudioHandler(event: QueueEvent) {
    try {
      if (event.eventName !== STUDIO_EVENT_NAME.CREATED) return;

      const { data } = event;
      const studio = await this.studioService.findById(data._id);
      if (!studio) return;

      const [defaultStudioCommission] = await Promise.all([
        this.settingService.getKeyValue(SETTING_KEYS.STUDIO_COMMISSION),
        studio.documentVerificationId
          ? this.fileService.addRef(studio.documentVerificationId, {
              itemId: studio._id,
              itemType: 'studio-document'
            })
          : null
      ]);
      studio.commission = defaultStudioCommission || parseInt(process.env.COMMISSION_RATE, 10);
      await this.studioModel.updateOne(
        { _id: data._id },
        { $set: { defaultStudioCommission } }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}

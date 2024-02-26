import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Injectable
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { TimeZonesService } from '../services/timezones.service';

@Injectable()
@Controller('timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimeZonesService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  list() {
    return DataResponse.ok(this.timezonesService.getList());
  }
}

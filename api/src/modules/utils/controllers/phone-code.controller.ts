import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Injectable
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { PhoneCodeService } from '../services/phone-code.service';

@Injectable()
@Controller('phone-codes')
export class PhoneCodeController {
  constructor(private readonly phoneCodeService: PhoneCodeService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  list() {
    return DataResponse.ok(this.phoneCodeService.getList());
  }
}

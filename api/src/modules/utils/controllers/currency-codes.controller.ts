import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Injectable
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrencyCodeService } from '../services';

@Injectable()
@Controller('currency-codes')
export class CurrecyCodeController {
  constructor(private readonly currencyCodeService: CurrencyCodeService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  list() {
    return DataResponse.ok(this.currencyCodeService.getList());
  }
}

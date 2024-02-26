import { Module, HttpModule } from '@nestjs/common';
import {
  CountryService,
  LanguageService,
  PhoneCodeService,
  RecaptchaService,
  TimeZonesService
} from './services';
import {
  CountryController,
  LanguageController,
  PhoneCodeController,
  RecaptchaController,
  TimezonesController
} from './controllers';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    })
  ],
  providers: [
    CountryService,
    LanguageService,
    PhoneCodeService,
    TimeZonesService,
    RecaptchaService
  ],
  controllers: [
    CountryController,
    LanguageController,
    PhoneCodeController,
    TimezonesController,
    RecaptchaController
  ],
  exports: [
    CountryService
  ]
})
export class UtilsModule {}

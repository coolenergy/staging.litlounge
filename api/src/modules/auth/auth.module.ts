import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { authProviders } from './providers/auth.provider';
import { UserModule } from '../user/user.module';
import { AuthService, VerificationService } from './services';
import { MailerModule } from '../mailer/mailer.module';
import { AuthGuard, RoleGuard } from './guards';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { PasswordController } from './controllers/password.controller';

// performer
import { PerformerRegisterController } from './controllers/performer-register.controller';
import { FileModule } from '../file/file.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerLoginController } from './controllers/performer-login.controller';
import { StudioRegisterController } from './controllers/studio-register.controller';
import { StudioLoginController } from './controllers/studio-login.controller';
import { StudioModule } from '../studio/studio.module';
import { VerifycationController } from './controllers/verification.controller';
import { SettingModule } from '../settings/setting.module';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => PerformerModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailerModule),
    forwardRef(() => FileModule),
    forwardRef(() => SettingModule),
    StudioModule
  ],
  providers: [
    ...authProviders,
    AuthService,
    VerificationService,
    AuthGuard,
    RoleGuard
  ],
  controllers: [
    RegisterController,
    LoginController,
    PasswordController,
    PerformerRegisterController,
    PerformerLoginController,
    StudioRegisterController,
    StudioLoginController,
    VerifycationController
  ],
  exports: [
    ...authProviders,
    AuthService,
    VerificationService,
    AuthGuard,
    RoleGuard
  ]
})
export class AuthModule {}

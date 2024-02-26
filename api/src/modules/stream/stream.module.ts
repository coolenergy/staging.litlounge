import { Module, forwardRef, HttpModule } from '@nestjs/common';
import * as https from 'https';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { assetsProviders } from './providers/stream.provider';
import { PerformerModule } from '../performer/performer.module';
import { AuthModule } from '../auth/auth.module';
import { StreamService, RequestService } from './services';
import { StreamController } from './controllers';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import { SocketModule } from '../socket/socket.module';
import { StreamConversationWsGateway, PrivateStreamWsGateway, PublicStreamWsGateway } from './gateways';
import { StreamConnectListener } from './listeners';
import { SettingModule } from '../settings/setting.module';

const agent = new https.Agent({
  rejectUnauthorized: false
});

@Module({
  imports: [
    MongoDBModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
      httpsAgent: agent
    }),
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => SettingModule),
    forwardRef(() => SocketModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => MessageModule)
  ],
  providers: [
    ...assetsProviders,
    StreamService,
    RequestService,
    StreamConnectListener,
    StreamConversationWsGateway,
    PrivateStreamWsGateway,
    PublicStreamWsGateway
  ],
  controllers: [StreamController],
  exports: [StreamService]
})
export class StreamModule {}

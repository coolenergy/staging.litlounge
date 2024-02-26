import { forwardRef, Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from 'nestjs-config';
import { AgendaModule, QueueModule } from 'src/kernel';
import { SocketUserService } from './services/socket-user.service';
import { WsUserConnectedGateway } from './gateways/user-connected.gateway';
import { AuthModule } from '../auth/auth.module';
import { SocketUserTask } from './tasks';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    QueueModule,
    AgendaModule.register(),
    // https://github.com/kyknow/nestjs-redis
    RedisModule.forRootAsync({
      // TODO - load config for redis socket
      useFactory: (configService: ConfigService) => configService.get('redis'),
      // useFactory: async (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    })
  ],
  providers: [
    SocketUserService,
    SocketUserTask,
    WsUserConnectedGateway
  ],
  controllers: [
  ],
  exports: [
    SocketUserService
  ]
})
export class SocketModule {}

/* eslint-disable no-console */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '../services';

@Injectable()
export class WSGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const { handshake } = client;
    console.log(client, handshake);
    throw new WsException('forbiden');
  }
}

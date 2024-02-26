import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { intersection } from 'lodash';
import { AuthService } from '../services';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) return false;
    const decodded = this.authService.verifyJWT(request.headers.authorization);
    if (!decodded) {
      return false;
    }
    const user =
      request.user ||
      (await this.authService.getSourceFromJWT(request.headers.authorization));
    if (!user || user.status !== 'active') {
      return false;
    }
    request.user = request.user || user;
    request.authUser = request.authUser || decodded;
    request.jwToken = request.jwToken || request.headers.authorization;
    if (user.isPerformer && roles.includes('performer')) {
      return true;
    }
    const diff = intersection(user.roles, roles);
    return diff.length > 0;
  }
}

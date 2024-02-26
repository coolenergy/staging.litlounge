import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }

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
    return true;
  }
}

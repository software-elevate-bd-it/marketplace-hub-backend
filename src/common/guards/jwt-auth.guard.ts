import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('[JwtAuthGuard] handleRequest - headers:', {
      authorization: request.headers?.authorization,
    });
    console.log('[JwtAuthGuard] handleRequest - err:', err);
    console.log('[JwtAuthGuard] handleRequest - info:', info);
    console.log('[JwtAuthGuard] handleRequest - user:', user);

    if (err || !user) {
      console.error('[JwtAuthGuard] Auth Error Info:', info);
      throw err || new UnauthorizedException('Invalid or missing token');
    }

    request.user = user;
    request.id = user.sub;
    request.email = user.email;

    console.log('[JwtAuthGuard] request.user populated:', request.user);
    return user;
  }
}
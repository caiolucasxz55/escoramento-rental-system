import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AppException } from '../common/app-exception';
import type { AdminTokenPayload } from './auth.service';

const unauthorized = () =>
  new AppException(
    'UNAUTHORIZED',
    HttpStatus.UNAUTHORIZED,
    'Token ausente, invalido ou expirado',
  );

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw unauthorized();

    const payload = await this.jwt
      .verifyAsync<AdminTokenPayload>(token)
      .catch(() => null);
    if (payload?.role !== 'admin') throw unauthorized();
    return true;
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AppException } from '../common/app-exception';
import { EnvironmentVariables } from '../config/env.validation';

export interface AdminTokenPayload {
  sub: string;
  role: 'admin';
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const adminEmail = this.config.get('ADMIN_EMAIL', { infer: true });
    const hash = this.config.get('ADMIN_PASSWORD_HASH', { infer: true });

    // compara a senha mesmo com e-mail errado: tempo de resposta igual
    const passwordOk = await compare(password, hash);
    const emailOk = email.trim().toLowerCase() === adminEmail.toLowerCase();
    if (!passwordOk || !emailOk) {
      throw new AppException(
        'INVALID_CREDENTIALS',
        HttpStatus.UNAUTHORIZED,
        'E-mail ou senha inválidos.',
      );
    }

    const payload: AdminTokenPayload = { sub: adminEmail, role: 'admin' };
    const accessToken = await this.jwt.signAsync(payload);
    const { exp, iat } = this.jwt.decode<{ exp: number; iat: number }>(
      accessToken,
    );
    return { accessToken, expiresIn: exp - iat };
  }
}

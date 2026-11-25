import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
import { AppException } from '../common/app-exception';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';

const SECRET = 'segredo-de-teste';
const env: Record<string, string> = {
  ADMIN_EMAIL: 'admin@escoramento.local',
  ADMIN_PASSWORD_HASH: hashSync('senha-certa', 4),
};
const config = { get: (k: string) => env[k] } as unknown as ConfigService;
const jwt = new JwtService({
  secret: SECRET,
  signOptions: { expiresIn: '1h' },
});

const contextWith = (authorization?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  }) as unknown as ExecutionContext;

describe('AuthService.login', () => {
  const auth = new AuthService(jwt, config as never);

  it('credenciais certas devolvem JWT de admin com 1h', async () => {
    const { accessToken, expiresIn } = await auth.login(
      'ADMIN@escoramento.local',
      'senha-certa',
    );
    const payload = jwt.verify<{ role: string; sub: string }>(accessToken);

    expect(expiresIn).toBe(3600);
    expect(payload).toMatchObject({
      role: 'admin',
      sub: 'admin@escoramento.local',
    });
  });

  it.each([
    ['senha errada', 'admin@escoramento.local', 'errada'],
    ['e-mail errado', 'outro@escoramento.local', 'senha-certa'],
  ])('%s -> 401 INVALID_CREDENTIALS', async (_label, email, password) => {
    await expect(auth.login(email, password)).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  });
});

describe('AdminGuard', () => {
  const guard = new AdminGuard(jwt);

  it('aceita Bearer valido com role admin', async () => {
    const token = await jwt.signAsync({ sub: 'a', role: 'admin' });

    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`)),
    ).resolves.toBe(true);
  });

  it.each([
    ['sem header', undefined],
    ['esquema errado', 'Basic abc'],
    ['token invalido', 'Bearer abc.def.ghi'],
  ])('%s -> 401', async (_label, header) => {
    await expect(guard.canActivate(contextWith(header))).rejects.toBeInstanceOf(
      AppException,
    );
  });

  it('token vencido -> 401', async () => {
    const expired = await jwt.signAsync(
      { sub: 'a', role: 'admin' },
      { expiresIn: -10 },
    );

    await expect(
      guard.canActivate(contextWith(`Bearer ${expired}`)),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('token assinado com outro segredo -> 401', async () => {
    const forged = await new JwtService({ secret: 'outro' }).signAsync({
      sub: 'a',
      role: 'admin',
    });

    await expect(
      guard.canActivate(contextWith(`Bearer ${forged}`)),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('token sem role admin -> 401', async () => {
    const token = await jwt.signAsync({ sub: 'a', role: 'cliente' });

    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`)),
    ).rejects.toMatchObject({ status: 401 });
  });
});

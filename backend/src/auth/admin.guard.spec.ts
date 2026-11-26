import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../common/app-exception';
import { AdminGuard } from './admin.guard';

const jwt = new JwtService({
  secret: 'segredo-de-teste',
  signOptions: { expiresIn: '1h' },
});

const contextWith = (authorization?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  }) as unknown as ExecutionContext;

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

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hashSync } from 'bcryptjs';
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

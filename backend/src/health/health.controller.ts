import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  /** 200 so quando o Mongo responde ao ping; 503 caso contrario. */
  @Get()
  async check() {
    const mongoUp = await this.connection.db
      ?.admin()
      .ping()
      .then(() => true)
      .catch(() => false);

    if (!mongoUp) {
      throw new ServiceUnavailableException({ status: 'error', mongo: 'down' });
    }
    return { status: 'ok', mongo: 'up' };
  }
}

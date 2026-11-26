import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'API no ar e Mongo respondendo' })
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

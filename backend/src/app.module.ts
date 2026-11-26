import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EnvironmentVariables, validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { RentalRequestsModule } from './rental-requests/rental-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
        // padrao e 30s: health demoraria para dar 503
        serverSelectionTimeoutMS: 3000,
      }),
    }),
    // so vale onde o ThrottlerGuard e aplicado (login e consulta publica)
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
      errorMessage: 'Muitas requisicoes; tente novamente em instantes',
    }),
    AuthModule,
    RentalRequestsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { EnvironmentVariables } from '../config/env.validation';
import { StorageModule } from '../storage/storage.module';
import { AdminRequestsController } from './admin-requests.controller';
import { MAX_FILES_PER_REQUEST, megabytesToBytes } from './file-validation';
import { PublicRequestsController } from './public-requests.controller';
import { RequestFilesService } from './request-files.service';
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
    // memoria (padrao); o limite corta o upload antes de ler tudo: 413
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        limits: {
          fileSize: megabytesToBytes(
            config.get('MAX_FILE_SIZE_MB', { infer: true }),
          ),
          files: MAX_FILES_PER_REQUEST,
        },
      }),
    }),
    AuthModule,
    StorageModule,
  ],
  controllers: [PublicRequestsController, AdminRequestsController],
  providers: [RequestsService, RequestFilesService],
})
export class RequestsModule {}

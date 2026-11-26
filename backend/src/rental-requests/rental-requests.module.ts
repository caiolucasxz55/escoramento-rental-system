import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { EnvironmentVariables } from '../config/env.validation';
import { StorageModule } from '../storage/storage.module';
import { AdminRentalRequestsController } from './admin-rental-requests.controller';
import { MAX_FILES_PER_REQUEST, megabytesToBytes } from './file-validation';
import { PublicRentalRequestsController } from './public-rental-requests.controller';
import { RentalRequestFilesService } from './rental-request-files.service';
import { RentalRequestsService } from './rental-requests.service';
import {
  RentalRequest,
  RentalRequestSchema,
} from './schemas/rental-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RentalRequest.name, schema: RentalRequestSchema },
    ]),
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
  controllers: [PublicRentalRequestsController, AdminRentalRequestsController],
  providers: [RentalRequestsService, RentalRequestFilesService],
})
export class RentalRequestsModule {}

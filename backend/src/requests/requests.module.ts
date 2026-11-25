import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AdminRequestsController } from './admin-requests.controller';
import { PublicRequestsController } from './public-requests.controller';
import { RequestsService } from './requests.service';
import { Request, RequestSchema } from './schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
    AuthModule,
  ],
  controllers: [PublicRequestsController, AdminRequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}

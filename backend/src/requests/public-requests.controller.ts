import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreateRequestDto } from './dto/create-request.dto';
import { MAX_FILES_PER_REQUEST } from './file-validation';
import { ParseUploadsPipe, ValidatedUpload } from './parse-uploads.pipe';
import { RequestsService } from './requests.service';
import { ApiCreateWithFiles } from './upload-docs';

export const CONSULTATION_TOKEN_HEADER = 'x-consultation-token';

@ApiTags('public')
@Controller('public/requests')
export class PublicRequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Post()
  @ApiCreateWithFiles()
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_REQUEST))
  create(
    @Body() dto: CreateRequestDto,
    @UploadedFiles(ParseUploadsPipe) uploads: ValidatedUpload[],
  ) {
    return this.requests.create(dto, uploads);
  }

  // token no header, nunca na query string (logs e historico)
  @Get(':id/status')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiHeader({ name: CONSULTATION_TOKEN_HEADER, required: true })
  getStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Headers(CONSULTATION_TOKEN_HEADER) token = '',
  ) {
    return this.requests.getPublicStatus(id, token);
  }
}

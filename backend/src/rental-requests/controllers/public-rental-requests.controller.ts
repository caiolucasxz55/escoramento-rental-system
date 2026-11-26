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
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ParseObjectIdPipe } from '../../common/parse-object-id.pipe';
import { CreateRentalRequestDto } from '../dto/create-rental-request.dto';
import { MAX_FILES_PER_REQUEST } from '../rules/file-validation';
import { ParseUploadsPipe, ValidatedUpload } from '../pipes/parse-uploads.pipe';
import { RentalRequestsService } from '../services/rental-requests.service';
import { ApiCreateWithFiles } from './upload-docs';

export const CONSULTATION_TOKEN_HEADER = 'x-consultation-token';

@ApiTags('public')
@Controller('public/requests')
export class PublicRentalRequestsController {
  constructor(private readonly rentalRequests: RentalRequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria a solicitacao (ate 5 arquivos); token aparece so aqui',
  })
  @ApiCreateWithFiles()
  @UseInterceptors(FilesInterceptor('files', MAX_FILES_PER_REQUEST))
  create(
    @Body() dto: CreateRentalRequestDto,
    @UploadedFiles(ParseUploadsPipe) uploads: ValidatedUpload[],
  ) {
    return this.rentalRequests.create(dto, uploads);
  }

  // token no header, nunca na query string (logs e historico)
  @Get(':id/status')
  @ApiOperation({ summary: 'Status publico com o token no header' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiHeader({ name: CONSULTATION_TOKEN_HEADER, required: true })
  getStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Headers(CONSULTATION_TOKEN_HEADER) token = '',
  ) {
    return this.rentalRequests.getPublicStatus(id, token);
  }
}

import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsService } from './requests.service';

export const CONSULTATION_TOKEN_HEADER = 'x-consultation-token';

@ApiTags('public')
@Controller('public/requests')
export class PublicRequestsController {
  constructor(private readonly requests: RequestsService) {}

  // multipart com arquivos entra na Fase 3
  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.requests.create(dto);
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

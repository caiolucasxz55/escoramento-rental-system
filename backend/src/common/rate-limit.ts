import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export const RATE_LIMIT = { limit: 10, ttl: 60_000 };

// rotas publicas sujeitas a abuso: 10 por minuto por IP, contadas por rota.
// o guard roda antes do Multer: requisicao barrada nem le o upload.
export const RateLimited = () =>
  applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: RATE_LIMIT }));

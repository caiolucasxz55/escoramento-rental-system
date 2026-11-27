import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

export const RATE_LIMIT = { limit: 10, ttl: 60_000 };

// 10/min por IP, contado por rota; o guard roda antes do Multer, entao a barrada nem le o upload
export const RateLimited = () =>
  applyDecorators(UseGuards(ThrottlerGuard), Throttle({ default: RATE_LIMIT }));

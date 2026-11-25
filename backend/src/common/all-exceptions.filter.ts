import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from './app-exception';

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  429: 'TOO_MANY_REQUESTS',
};

export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { statusCode, error, message } = this.describe(exception);
    if (statusCode >= 500) {
      // stack so no log, nunca na resposta
      this.logger.error(
        `${req.method} ${req.path}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      statusCode,
      error,
      message,
      path: req.path,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(body);
  }

  private describe(exception: unknown) {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        error: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      if (statusCode < 500) {
        const response = exception.getResponse();
        // ValidationPipe devolve message como array
        const raw =
          typeof response === 'object' && response !== null
            ? (response as { message?: unknown }).message
            : response;
        const message = Array.isArray(raw)
          ? raw.join('; ')
          : typeof raw === 'string'
            ? raw
            : exception.message;
        const error =
          statusCode === 400 && Array.isArray(raw)
            ? 'VALIDATION_ERROR'
            : (DEFAULT_CODES[statusCode] ?? 'ERROR');
        return { statusCode, error, message };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_ERROR',
      message: 'Erro interno inesperado',
    };
  }
}

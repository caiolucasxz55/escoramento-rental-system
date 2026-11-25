import { HttpException, HttpStatus } from '@nestjs/common';

// unica excecao de negocio; `code` e estavel para o frontend
export class AppException extends HttpException {
  constructor(
    readonly code: string,
    status: HttpStatus,
    message: string,
  ) {
    super({ code, message }, status);
  }
}

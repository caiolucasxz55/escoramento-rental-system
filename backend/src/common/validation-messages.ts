import type { ValidationError } from 'class-validator';

// constraint que o ValidationPipe gera para campo fora do DTO (forbidNonWhitelisted)
const NOT_ALLOWED = 'whitelistValidation';

// uma mensagem por problema, em portugues; os DTOs ja trazem as suas
export function validationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.entries(error.constraints ?? {}).map(([constraint, message]) =>
      constraint === NOT_ALLOWED
        ? `O campo "${error.property}" não é permitido.`
        : message,
    ),
    ...validationMessages(error.children ?? []),
  ]);
}

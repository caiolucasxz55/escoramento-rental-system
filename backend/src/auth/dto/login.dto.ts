import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /** @example "admin@escoramento.local" */
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString({ message: 'Informe a senha.' })
  @MinLength(1, { message: 'Informe a senha.' })
  password: string;
}

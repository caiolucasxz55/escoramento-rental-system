import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { PHONE_PATTERN } from '../schemas/request.schema';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateRequestDto {
  /** @example "Construtora Exemplo Ltda" */
  @Transform(trim)
  @IsString()
  @Length(2, 120)
  name: string;

  /** @example "contato@exemplo.com" */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  /**
   * Aceita mascara; guarda so os digitos (10 a 13).
   * @example "(11) 98765-4321"
   */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone deve ter de 10 a 13 digitos' })
  phone: string;

  /** @example "Preciso de 40 escoras metalicas por 30 dias para a obra X." */
  @Transform(trim)
  @IsString()
  @Length(10, 2000)
  description: string;
}

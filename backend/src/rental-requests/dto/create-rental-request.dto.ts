import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import {
  DESCRIPTION_LENGTH,
  NAME_LENGTH,
  PHONE_PATTERN,
} from '../rules/field-rules';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// mensagens chegam ao usuario final: em portugues
export class CreateRentalRequestDto {
  /** @example "Construtora Exemplo Ltda" */
  @Transform(trim)
  @IsString({ message: 'Informe o nome ou empresa.' })
  @Length(NAME_LENGTH.min, NAME_LENGTH.max, {
    message: `O nome deve ter entre ${NAME_LENGTH.min} e ${NAME_LENGTH.max} caracteres.`,
  })
  name: string;

  /** @example "contato@exemplo.com" */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  /**
   * Aceita mascara; guarda so os digitos (10 a 13).
   * @example "(11) 98765-4321"
   */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'Informe o telefone.' })
  @Matches(PHONE_PATTERN, {
    message: 'O telefone deve ter de 10 a 13 dígitos, com DDD.',
  })
  phone: string;

  /** @example "Preciso de 40 escoras metalicas por 30 dias para a obra X." */
  @Transform(trim)
  @IsString({ message: 'Informe a descrição do pedido.' })
  @Length(DESCRIPTION_LENGTH.min, DESCRIPTION_LENGTH.max, {
    message: `A descrição deve ter entre ${DESCRIPTION_LENGTH.min} e ${DESCRIPTION_LENGTH.max} caracteres.`,
  })
  description: string;
}

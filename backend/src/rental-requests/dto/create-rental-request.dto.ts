import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { PHONE_PATTERN } from '../schemas/rental-request.schema';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// mensagens chegam ao usuario final: em portugues
export class CreateRentalRequestDto {
  /** @example "Construtora Exemplo Ltda" */
  @Transform(trim)
  @IsString({ message: 'Informe o nome ou empresa.' })
  @Length(2, 120, { message: 'O nome deve ter entre 2 e 120 caracteres.' })
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
  @Length(10, 2000, {
    message: 'A descrição deve ter entre 10 e 2000 caracteres.',
  })
  description: string;
}

import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { SEARCH_LENGTH } from '../rules/search';
import { RentalRequestStatus } from '../rules/status-transitions';
import { INVALID_STATUS_MESSAGE } from './change-status.dto';

export const MAX_PAGE_SIZE = 50;

export class ListQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página deve ser 1 ou maior.' })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite deve ser 1 ou maior.' })
  @Max(MAX_PAGE_SIZE, {
    message: `O limite deve ser no máximo ${MAX_PAGE_SIZE}.`,
  })
  limit: number = 10;

  @IsOptional()
  @IsEnum(RentalRequestStatus, { message: INVALID_STATUS_MESSAGE })
  status?: RentalRequestStatus;

  /** trecho de nome, e-mail ou telefone; ignora maiusculas e acentos */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsOptional()
  @IsString({ message: 'A busca deve ser um texto.' })
  @Length(SEARCH_LENGTH.min, SEARCH_LENGTH.max, {
    message: `A busca deve ter entre ${SEARCH_LENGTH.min} e ${SEARCH_LENGTH.max} caracteres.`,
  })
  q?: string;
}

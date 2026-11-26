import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
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
}

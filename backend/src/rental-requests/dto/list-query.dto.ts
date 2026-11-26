import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { RentalRequestStatus } from '../rules/status-transitions';

export const MAX_PAGE_SIZE = 50;

export class ListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = 10;

  @IsOptional()
  @IsEnum(RentalRequestStatus)
  status?: RentalRequestStatus;
}

import { IsEnum } from 'class-validator';
import { RentalRequestStatus } from '../rules/status-transitions';

export const INVALID_STATUS_MESSAGE = `Status inválido. Use: ${Object.values(RentalRequestStatus).join(', ')}.`;

export class ChangeStatusDto {
  @IsEnum(RentalRequestStatus, { message: INVALID_STATUS_MESSAGE })
  status: RentalRequestStatus;
}

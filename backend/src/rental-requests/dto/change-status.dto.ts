import { IsEnum } from 'class-validator';
import { RentalRequestStatus } from '../rules/status-transitions';

export class ChangeStatusDto {
  @IsEnum(RentalRequestStatus, {
    message: `Status inválido. Use: ${Object.values(RentalRequestStatus).join(', ')}.`,
  })
  status: RentalRequestStatus;
}

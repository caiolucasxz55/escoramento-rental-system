import { IsEnum } from 'class-validator';
import { RentalRequestStatus } from '../rules/status-transitions';

export class ChangeStatusDto {
  @IsEnum(RentalRequestStatus)
  status: RentalRequestStatus;
}

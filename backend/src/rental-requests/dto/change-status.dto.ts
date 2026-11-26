import { IsEnum } from 'class-validator';
import { RentalRequestStatus } from '../status-transitions';

export class ChangeStatusDto {
  @IsEnum(RentalRequestStatus)
  status: RentalRequestStatus;
}

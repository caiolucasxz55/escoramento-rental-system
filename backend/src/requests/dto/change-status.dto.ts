import { IsEnum } from 'class-validator';
import { RequestStatus } from '../status-transitions';

export class ChangeStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}

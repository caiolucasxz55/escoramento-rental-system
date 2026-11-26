import { PartialType } from '@nestjs/swagger';
import { CreateRentalRequestDto } from './create-rental-request.dto';

// status e files ficam de fora: forbidNonWhitelisted devolve 400
export class UpdateRentalRequestDto extends PartialType(
  CreateRentalRequestDto,
) {}

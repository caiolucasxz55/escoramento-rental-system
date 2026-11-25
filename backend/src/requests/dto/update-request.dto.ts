import { PartialType } from '@nestjs/swagger';
import { CreateRequestDto } from './create-request.dto';

// status e files ficam de fora: forbidNonWhitelisted devolve 400
export class UpdateRequestDto extends PartialType(CreateRequestDto) {}

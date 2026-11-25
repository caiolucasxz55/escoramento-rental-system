import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { AppException } from './app-exception';

// isValid aceita qualquer string de 12 chars; exige o formato hex de 24
const OBJECT_ID = /^[0-9a-f]{24}$/i;

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!OBJECT_ID.test(value) || !Types.ObjectId.isValid(value)) {
      throw new AppException(
        'INVALID_ID',
        HttpStatus.BAD_REQUEST,
        'Identificador invalido',
      );
    }
    return value;
  }
}

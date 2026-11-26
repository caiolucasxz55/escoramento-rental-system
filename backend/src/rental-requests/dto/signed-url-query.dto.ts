import { IsIn, IsOptional } from 'class-validator';
import {
  DISPOSITIONS,
  type Disposition,
} from '../../storage/storage.interface';

export class SignedUrlQueryDto {
  /** inline exibe no navegador (preview); attachment forca o download */
  @IsOptional()
  @IsIn(DISPOSITIONS)
  disposition?: Disposition = 'attachment';
}

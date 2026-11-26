import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '../../common/app-exception';
import { EnvironmentVariables } from '../../config/env.validation';
import {
  checkFile,
  DetectedFileType,
  FileCheck,
  megabytesToBytes,
  sanitizeFilename,
} from '../rules/file-validation';

export interface ValidatedUpload {
  buffer: Buffer;
  originalName: string;
  size: number;
  type: DetectedFileType;
}

type Rejection = Extract<FileCheck, { ok: false }>['reason'];

const STATUS_BY_REASON: Record<Rejection, HttpStatus> = {
  EMPTY_FILE: HttpStatus.BAD_REQUEST,
  FILE_TOO_LARGE: HttpStatus.PAYLOAD_TOO_LARGE,
  UNSUPPORTED_FILE_TYPE: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
};

const MESSAGE_BY_REASON: Record<Rejection, string> = {
  EMPTY_FILE: 'Arquivo vazio',
  FILE_TOO_LARGE: 'Arquivo acima do tamanho maximo',
  UNSUPPORTED_FILE_TYPE: 'Tipo de arquivo nao aceito (PDF, PNG ou JPEG)',
};

// o tipo vem do conteudo; nome e mimetype do navegador sao ignorados
@Injectable()
export class ParseUploadsPipe implements PipeTransform {
  private readonly maxBytes: number;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    this.maxBytes = megabytesToBytes(
      config.get('MAX_FILE_SIZE_MB', { infer: true }),
    );
  }

  transform(
    input: Express.Multer.File | Express.Multer.File[] | undefined,
  ): ValidatedUpload[] {
    const files = input === undefined ? [] : [input].flat();

    return files.map((file) => {
      const check = checkFile(file.buffer, this.maxBytes);
      if (!check.ok) {
        const name = sanitizeFilename(file.originalname, 'arquivo');
        throw new AppException(
          check.reason,
          STATUS_BY_REASON[check.reason],
          `${MESSAGE_BY_REASON[check.reason]}: ${name}`,
        );
      }
      return {
        buffer: file.buffer,
        originalName: sanitizeFilename(
          file.originalname,
          `arquivo${check.type.ext}`,
        ),
        size: file.size,
        type: check.type,
      };
    });
  }
}

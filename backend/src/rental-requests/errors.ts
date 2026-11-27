import { HttpStatus } from '@nestjs/common';
import { AppException } from '../common/app-exception';
import { MAX_FILES_PER_REQUEST } from '../common/upload-limits';
import type { RentalRequestStatus } from './rules/status-transitions';

// erros de negocio das solicitacoes: o `code` e o contrato com o frontend
export const requestNotFound = () =>
  new AppException(
    'REQUEST_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Solicitação não encontrada.',
  );

export const requestNotEditable = () =>
  new AppException(
    'REQUEST_NOT_EDITABLE',
    HttpStatus.CONFLICT,
    'Solicitação aprovada ou cancelada não pode ser alterada.',
  );

export const nothingToUpdate = () =>
  new AppException(
    'NOTHING_TO_UPDATE',
    HttpStatus.BAD_REQUEST,
    'Envie ao menos um campo para alterar.',
  );

export const invalidStatusTransition = (
  from: RentalRequestStatus,
  to: RentalRequestStatus,
) =>
  new AppException(
    'INVALID_STATUS_TRANSITION',
    HttpStatus.CONFLICT,
    `Não é possível mudar de ${from} para ${to}.`,
  );

export const statusConflict = () =>
  new AppException(
    'STATUS_CONFLICT',
    HttpStatus.CONFLICT,
    'Status alterado por outra operação.',
  );

export const concurrentUpdate = () =>
  new AppException(
    'CONCURRENT_UPDATE',
    HttpStatus.CONFLICT,
    'Solicitação alterada por outra operação.',
  );

export const fileNotFound = () =>
  new AppException(
    'FILE_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Arquivo não encontrado nesta solicitação.',
  );

export const noFiles = (message: string) =>
  new AppException('NO_FILES', HttpStatus.BAD_REQUEST, message);

export const fileLimitReached = () =>
  new AppException(
    'FILE_LIMIT_REACHED',
    HttpStatus.CONFLICT,
    `Limite de ${MAX_FILES_PER_REQUEST} arquivos por solicitação.`,
  );

export const uploadTooLarge = (maxTotalMb: number) =>
  new AppException(
    'UPLOAD_TOO_LARGE',
    HttpStatus.PAYLOAD_TOO_LARGE,
    `Os arquivos somam mais de ${maxTotalMb} MB. Envie arquivos menores ou em menor quantidade.`,
  );

export const storageQuotaExceeded = () =>
  new AppException(
    'STORAGE_QUOTA_EXCEEDED',
    HttpStatus.INSUFFICIENT_STORAGE,
    'Limite de armazenamento atingido. Envie sem anexos ou tente mais tarde.',
  );

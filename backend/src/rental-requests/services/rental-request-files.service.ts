import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppException } from '../../common/app-exception';
import {
  MAX_FILES_PER_REQUEST,
  megabytesToBytes,
} from '../../common/upload-limits';
import { EnvironmentVariables } from '../../config/env.validation';
import {
  STORAGE,
  type Disposition,
  type Storage,
} from '../../storage/storage.interface';
import {
  concurrentUpdate,
  fileLimitReached,
  fileNotFound,
  noFiles,
  requestNotEditable,
  requestNotFound,
  storageQuotaExceeded,
} from '../errors';
import { DetailView, toDetail } from '../mappers/rental-request.mappers';
import type { ValidatedUpload } from '../pipes/parse-uploads.pipe';
import { EDITABLE_STATUSES, isFinal } from '../rules/status-transitions';
import { FileMeta, RentalRequest } from '../schemas/rental-request.schema';

export interface SignedUrl {
  url: string;
  expiresIn: number;
}

type FileRef = Pick<FileMeta, '_id' | 'key'>;

// Mongo nunca aponta para objeto inexistente; no pior caso sobra um orfao privado no S3, logado
@Injectable()
export class RentalRequestFilesService {
  private readonly logger = new Logger(RentalRequestFilesService.name);
  private readonly signedUrlTtl: number;
  private readonly quotaBytes: number | null;

  constructor(
    @InjectModel(RentalRequest.name)
    private readonly model: Model<RentalRequest>,
    @Inject(STORAGE) private readonly storage: Storage,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.signedUrlTtl = config.get('SIGNED_URL_TTL_SECONDS', { infer: true });
    const quota = config.get('STORAGE_QUOTA_MB', { infer: true });
    this.quotaBytes = quota ? megabytesToBytes(quota) : null;
  }

  // tudo ou nada: se um envio falhar, apaga os que ja subiram
  async uploadAll(
    rentalRequestId: Types.ObjectId,
    uploads: ValidatedUpload[],
  ): Promise<FileMeta[]> {
    await this.ensureQuota(uploads);
    const sent: FileMeta[] = [];
    try {
      for (const upload of uploads) {
        const meta = this.toMeta(rentalRequestId, upload);
        await this.storage.put({
          key: meta.key,
          body: upload.buffer,
          contentType: meta.mimeType,
        });
        sent.push(meta);
      }
      return sent;
    } catch (error) {
      await this.discard(sent);
      throw error;
    }
  }

  async discard(files: Pick<FileMeta, 'key'>[]): Promise<void> {
    await Promise.all(files.map(({ key }) => this.deleteQuietly(key)));
  }

  async add(id: string, uploads: ValidatedUpload[]): Promise<DetailView> {
    if (uploads.length === 0) throw noFiles('Envie ao menos um arquivo.');

    // checagem barata antes de subir ao S3; a garantia e a escrita condicional
    const { files } = await this.editableOrThrow(id);
    if (files.length + uploads.length > MAX_FILES_PER_REQUEST) {
      throw fileLimitReached();
    }

    const metas = await this.uploadAll(new Types.ObjectId(id), uploads);
    // files.{5-n} inexistente = ainda cabem n; checado na propria escrita
    const updated = await this.writeOrDiscard(metas, () =>
      this.model
        .findOneAndUpdate(
          {
            _id: id,
            status: { $in: EDITABLE_STATUSES },
            [`files.${MAX_FILES_PER_REQUEST - uploads.length}`]: {
              $exists: false,
            },
          },
          { $push: { files: { $each: metas } } },
          { returnDocument: 'after' },
        )
        .lean(),
    );
    if (!updated) throw await this.rejection(id, undefined, fileLimitReached);
    return toDetail(updated);
  }

  // $pull primeiro, DeleteObject depois
  async remove(id: string, fileId: string): Promise<void> {
    const before = await this.model
      .findOneAndUpdate(
        { _id: id, status: { $in: EDITABLE_STATUSES }, 'files._id': fileId },
        { $pull: { files: { _id: fileId } } },
        { returnDocument: 'before' },
      )
      .lean();
    if (!before) throw await this.rejection(id, fileId);

    const removed = before.files.find((f) => String(f._id) === fileId);
    if (removed) await this.deleteQuietly(removed.key);
  }

  // envia o novo, troca o subdocumento, apaga o antigo
  async replace(
    id: string,
    fileId: string,
    upload: ValidatedUpload | undefined,
  ): Promise<DetailView> {
    if (!upload) throw noFiles('Envie o arquivo substituto.');

    const { files } = await this.editableOrThrow(id, fileId);
    const oldKey = files.find((f) => String(f._id) === fileId)!.key;

    const [meta] = await this.uploadAll(new Types.ObjectId(id), [upload]);
    meta._id = new Types.ObjectId(fileId); // fileId continua o mesmo

    // a chave lida entra na condicao: se outra troca chegou antes, nao aplica
    const updated = await this.writeOrDiscard([meta], () =>
      this.model
        .findOneAndUpdate(
          {
            _id: id,
            status: { $in: EDITABLE_STATUSES },
            files: { $elemMatch: { _id: fileId, key: oldKey } },
          },
          { $set: { 'files.$': meta } },
          { returnDocument: 'after' },
        )
        .lean(),
    );
    if (!updated) throw await this.rejection(id, fileId);

    await this.deleteQuietly(oldKey);
    return toDetail(updated);
  }

  async signedUrl(
    id: string,
    fileId: string,
    disposition: Disposition = 'attachment',
  ): Promise<SignedUrl> {
    const found = await this.model
      .findOne({ _id: id, 'files._id': fileId }, { 'files.$': 1 })
      .lean();
    const file = found?.files[0];
    if (!file) throw await this.rejection(id, fileId);

    const url = await this.storage.getSignedDownloadUrl(file.key, {
      filename: file.originalName,
      contentType: file.mimeType,
      expiresInSeconds: this.signedUrlTtl,
      disposition,
    });
    return { url, expiresIn: this.signedUrlTtl };
  }

  // cota branda: dois uploads simultaneos podem passar um pouco do limite
  private async ensureQuota(uploads: ValidatedUpload[]): Promise<void> {
    if (this.quotaBytes === null || uploads.length === 0) return;

    const [usage] = await this.model.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: { $sum: '$files.size' } } } },
    ]);
    const incoming = uploads.reduce((sum, { size }) => sum + size, 0);
    if ((usage?.total ?? 0) + incoming > this.quotaBytes) {
      throw storageQuotaExceeded();
    }
  }

  private toMeta(
    rentalRequestId: Types.ObjectId,
    upload: ValidatedUpload,
  ): FileMeta {
    return {
      _id: new Types.ObjectId(),
      // nome original nunca entra na chave
      key: `rental-requests/${String(rentalRequestId)}/${randomUUID()}${upload.type.ext}`,
      originalName: upload.originalName,
      mimeType: upload.type.mimeType,
      size: upload.size,
      uploadedAt: new Date(),
    };
  }

  // escrita nao aplicou ou falhou: o que foi enviado ao storage sai
  private async writeOrDiscard<T>(
    sent: FileMeta[],
    write: () => Promise<T | null>,
  ): Promise<T | null> {
    let result: T | null;
    try {
      result = await write();
    } catch (error) {
      await this.discard(sent);
      throw error;
    }
    if (!result) await this.discard(sent);
    return result;
  }

  private async deleteQuietly(key: string): Promise<void> {
    try {
      await this.storage.delete(key);
    } catch (error) {
      this.logger.error(
        `Objeto orfao no storage: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // 404 se a solicitacao (ou o arquivo) nao existe, 409 se esta finalizada
  private async editableOrThrow(
    id: string,
    fileId?: string,
  ): Promise<{ files: FileRef[] }> {
    const doc = await this.model
      .findById(id, { status: 1, 'files._id': 1, 'files.key': 1 })
      .lean();
    if (!doc) throw requestNotFound();
    if (fileId && !doc.files.some((f) => String(f._id) === fileId)) {
      throw fileNotFound();
    }
    if (isFinal(doc.status)) throw requestNotEditable();
    return doc;
  }

  // escrita condicional nao aplicou: o mesmo diagnostico, senao `otherwise`
  private async rejection(
    id: string,
    fileId?: string,
    otherwise: () => AppException = concurrentUpdate,
  ): Promise<AppException> {
    try {
      await this.editableOrThrow(id, fileId);
    } catch (error) {
      if (error instanceof AppException) return error;
      throw error;
    }
    return otherwise();
  }
}

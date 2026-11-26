import { randomUUID } from 'node:crypto';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppException } from '../../common/app-exception';
import { EnvironmentVariables } from '../../config/env.validation';
import {
  STORAGE,
  type Disposition,
  type Storage,
} from '../../storage/storage.interface';
import { MAX_FILES_PER_REQUEST } from '../rules/file-validation';
import type { ValidatedUpload } from '../pipes/parse-uploads.pipe';
import { DetailView, toDetail } from '../mappers/rental-request.mappers';
import { FileMeta, RentalRequest } from '../schemas/rental-request.schema';
import { EDITABLE_STATUSES, isFinal } from '../rules/status-transitions';

export interface SignedUrl {
  url: string;
  expiresIn: number;
}

const editableWithFile = (id: string, fileId: string) => ({
  _id: id,
  status: { $in: EDITABLE_STATUSES },
  'files._id': fileId,
});

const noFiles = (message: string) =>
  new AppException('NO_FILES', HttpStatus.BAD_REQUEST, message);

// Mongo nunca aponta para objeto inexistente; no pior caso sobra um objeto
// orfao (privado) no S3, logado com a chave.
@Injectable()
export class RentalRequestFilesService {
  private readonly logger = new Logger(RentalRequestFilesService.name);
  private readonly signedUrlTtl: number;

  constructor(
    @InjectModel(RentalRequest.name)
    private readonly model: Model<RentalRequest>,
    @Inject(STORAGE) private readonly storage: Storage,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.signedUrlTtl = config.get('SIGNED_URL_TTL_SECONDS', { infer: true });
  }

  // tudo ou nada: se um envio falhar, apaga os que ja subiram
  async uploadAll(
    rentalRequestId: Types.ObjectId,
    uploads: ValidatedUpload[],
  ): Promise<FileMeta[]> {
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
    if (!updated) {
      throw await this.rejection(
        id,
        undefined,
        () =>
          new AppException(
            'FILE_LIMIT_REACHED',
            HttpStatus.CONFLICT,
            `Limite de ${MAX_FILES_PER_REQUEST} arquivos por solicitação.`,
          ),
      );
    }
    return toDetail(updated);
  }

  // $pull primeiro, DeleteObject depois
  async remove(id: string, fileId: string): Promise<void> {
    const before = await this.model
      .findOneAndUpdate(
        editableWithFile(id, fileId),
        { $pull: { files: { _id: fileId } } },
        { returnDocument: 'before' },
      )
      .lean();
    if (!before) throw await this.rejection(id, fileId);

    await this.deleteQuietly(this.keyOf(before, fileId));
  }

  // envia o novo, troca o subdocumento, apaga o antigo
  async replace(
    id: string,
    fileId: string,
    upload: ValidatedUpload | undefined,
  ): Promise<DetailView> {
    if (!upload) throw noFiles('Envie o arquivo substituto.');

    const [meta] = await this.uploadAll(new Types.ObjectId(id), [upload]);
    meta._id = new Types.ObjectId(fileId); // fileId continua o mesmo

    const before = await this.writeOrDiscard([meta], () =>
      this.model
        .findOneAndUpdate(
          editableWithFile(id, fileId),
          { $set: { 'files.$': meta } },
          { returnDocument: 'before' },
        )
        .lean(),
    );
    if (!before) throw await this.rejection(id, fileId);

    await this.deleteQuietly(this.keyOf(before, fileId));
    const fresh = await this.model.findById(id).lean();
    if (!fresh) throw await this.rejection(id);
    return toDetail(fresh);
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

  private keyOf(doc: Pick<RentalRequest, 'files'>, fileId: string): string {
    return doc.files.find((f) => String(f._id) === fileId)!.key;
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

  // escrita condicional nao aplicou: descobre o motivo (404 ou 409)
  private async rejection(
    id: string,
    fileId?: string,
    otherwise: () => AppException = () =>
      new AppException(
        'CONCURRENT_UPDATE',
        HttpStatus.CONFLICT,
        'Solicitação alterada por outra operação.',
      ),
  ): Promise<AppException> {
    const doc = await this.model
      .findById(id, { status: 1, 'files._id': 1 })
      .lean();
    if (!doc) {
      return new AppException(
        'REQUEST_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'Solicitação não encontrada.',
      );
    }
    if (fileId && !doc.files.some((f) => String(f._id) === fileId)) {
      return new AppException(
        'FILE_NOT_FOUND',
        HttpStatus.NOT_FOUND,
        'Arquivo não encontrado nesta solicitação.',
      );
    }
    if (isFinal(doc.status)) {
      return new AppException(
        'REQUEST_NOT_EDITABLE',
        HttpStatus.CONFLICT,
        'Solicitação aprovada ou cancelada não pode ser alterada.',
      );
    }
    return otherwise();
  }
}

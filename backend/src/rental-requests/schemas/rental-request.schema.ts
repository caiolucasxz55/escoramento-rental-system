import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MAX_FILES_PER_REQUEST } from '../../common/upload-limits';
import {
  DESCRIPTION_LENGTH,
  NAME_LENGTH,
  PHONE_PATTERN,
} from '../rules/field-rules';
import { RentalRequestStatus } from '../rules/status-transitions';

@Schema({ _id: true })
export class FileMeta {
  _id: Types.ObjectId;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, min: 1 })
  size: number;

  @Prop({ required: true, default: () => new Date() })
  uploadedAt: Date;
}

export const FileMetaSchema = SchemaFactory.createForClass(FileMeta);

@Schema({ collection: 'rental_requests', timestamps: true })
export class RentalRequest {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    minlength: NAME_LENGTH.min,
    maxlength: NAME_LENGTH.max,
  })
  name: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, match: PHONE_PATTERN })
  phone: string;

  @Prop({
    required: true,
    trim: true,
    minlength: DESCRIPTION_LENGTH.min,
    maxlength: DESCRIPTION_LENGTH.max,
  })
  description: string;

  // type explicito: metadado de enum importado se perde com isolatedModules
  @Prop({
    type: String,
    required: true,
    enum: Object.values(RentalRequestStatus),
    default: RentalRequestStatus.PENDING,
  })
  status: RentalRequestStatus;

  @Prop({ required: true, select: false })
  consultationTokenHash: string;

  @Prop({
    type: [FileMetaSchema],
    default: [],
    validate: {
      validator: (files: unknown[]) => files.length <= MAX_FILES_PER_REQUEST,
      message: `No máximo ${MAX_FILES_PER_REQUEST} arquivos.`,
    },
  })
  files: FileMeta[];

  createdAt: Date;
  updatedAt: Date;
}

export type RentalRequestDocument = HydratedDocument<RentalRequest>;

export const RentalRequestSchema = SchemaFactory.createForClass(RentalRequest);

RentalRequestSchema.index({ status: 1, createdAt: -1 });
RentalRequestSchema.index({ createdAt: -1 });

// rede de seguranca: as respostas saem pelos mappers, nao pelo documento
RentalRequestSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const { _id, consultationTokenHash: _hash, files, ...rest } = ret;
    return {
      id: String(_id),
      ...rest,
      files: files.map(({ _id: fileId, key: _key, ...file }) => ({
        id: String(fileId),
        ...file,
      })),
    };
  },
});

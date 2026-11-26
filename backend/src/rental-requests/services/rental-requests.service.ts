import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppException } from '../../common/app-exception';
import {
  consultationTokenMatches,
  generateConsultationToken,
  hashConsultationToken,
} from '../../common/consultation-token';
import { CreateRentalRequestDto } from '../dto/create-rental-request.dto';
import { ListQueryDto } from '../dto/list-query.dto';
import { UpdateRentalRequestDto } from '../dto/update-rental-request.dto';
import type { ValidatedUpload } from '../pipes/parse-uploads.pipe';
import { RentalRequestFilesService } from './rental-request-files.service';
import {
  DetailView,
  ListItemView,
  ListRow,
  PublicStatusView,
  toDetail,
  toListItem,
  toPublicStatus,
} from '../mappers/rental-request.mappers';
import { RentalRequest } from '../schemas/rental-request.schema';
import {
  canTransition,
  EDITABLE_STATUSES,
  RentalRequestStatus,
} from '../rules/status-transitions';

export interface CreatedRentalRequest {
  id: string;
  token: string;
  status: RentalRequestStatus;
}

export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const notFound = () =>
  new AppException(
    'REQUEST_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Solicitação não encontrada.',
  );

@Injectable()
export class RentalRequestsService {
  constructor(
    @InjectModel(RentalRequest.name)
    private readonly model: Model<RentalRequest>,
    private readonly files: RentalRequestFilesService,
  ) {}

  // id gerado antes: a chave no S3 ja nasce com ele; S3 antes do Mongo
  async create(
    { name, email, phone, description }: CreateRentalRequestDto,
    uploads: ValidatedUpload[],
  ): Promise<CreatedRentalRequest> {
    const _id = new Types.ObjectId();
    const metas = await this.files.uploadAll(_id, uploads);

    const token = generateConsultationToken();
    try {
      const created = await this.model.create({
        _id,
        name,
        email,
        phone,
        description,
        files: metas,
        consultationTokenHash: hashConsultationToken(token),
      });
      return { id: String(created._id), token, status: created.status };
    } catch (error) {
      await this.files.discard(metas);
      throw error;
    }
  }

  // id inexistente e token errado dao o mesmo 404
  async getPublicStatus(id: string, token: string): Promise<PublicStatusView> {
    const found = await this.model
      .findById(id)
      .select('+consultationTokenHash')
      .lean();
    if (
      !found ||
      !consultationTokenMatches(token, found.consultationTokenHash)
    ) {
      throw notFound();
    }
    return toPublicStatus(found);
  }

  async list({
    page,
    limit,
    status,
  }: ListQueryDto): Promise<Page<ListItemView>> {
    const filter = status ? { status } : {};
    const [rows, total] = await Promise.all([
      this.model
        .find(filter, {
          name: 1,
          status: 1,
          createdAt: 1,
          filesCount: { $size: '$files' },
        })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ListRow[]>(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: rows.map(toListItem),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findDetail(id: string): Promise<DetailView> {
    const found = await this.model.findById(id).lean();
    if (!found) throw notFound();
    return toDetail(found);
  }

  async update(id: string, dto: UpdateRentalRequestDto): Promise<DetailView> {
    // sem isso o $set vazio so mexeria no updatedAt
    if (Object.keys(dto).length === 0) {
      throw new AppException(
        'NOTHING_TO_UPDATE',
        HttpStatus.BAD_REQUEST,
        'Envie ao menos um campo para alterar.',
      );
    }
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, status: { $in: EDITABLE_STATUSES } },
        { $set: dto },
        { returnDocument: 'after', runValidators: true },
      )
      .lean();
    if (updated) return toDetail(updated);

    await this.throwIfMissing(id);
    throw new AppException(
      'REQUEST_NOT_EDITABLE',
      HttpStatus.CONFLICT,
      'Solicitação aprovada ou cancelada não pode ser alterada.',
    );
  }

  async changeStatus(
    id: string,
    next: RentalRequestStatus,
  ): Promise<DetailView> {
    const current = await this.model.findById(id, { status: 1 }).lean();
    if (!current) throw notFound();

    if (!canTransition(current.status, next)) {
      throw new AppException(
        'INVALID_STATUS_TRANSITION',
        HttpStatus.CONFLICT,
        `Não é possível mudar de ${current.status} para ${next}.`,
      );
    }

    // so aplica se ninguem mudou o status entre a leitura e a escrita
    const updated = await this.model
      .findOneAndUpdate(
        { _id: id, status: current.status },
        { $set: { status: next } },
        { returnDocument: 'after' },
      )
      .lean();
    if (!updated) {
      throw new AppException(
        'STATUS_CONFLICT',
        HttpStatus.CONFLICT,
        'Status alterado por outra operação.',
      );
    }
    return toDetail(updated);
  }

  private async throwIfMissing(id: string): Promise<void> {
    if (!(await this.model.exists({ _id: id }))) throw notFound();
  }
}

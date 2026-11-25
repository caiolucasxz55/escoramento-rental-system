import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException } from '../common/app-exception';
import {
  consultationTokenMatches,
  generateConsultationToken,
  hashConsultationToken,
} from '../common/consultation-token';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import {
  DetailView,
  ListItemView,
  ListRow,
  PublicStatusView,
  toDetail,
  toListItem,
  toPublicStatus,
} from './request.mappers';
import { Request } from './schemas/request.schema';
import {
  canTransition,
  EDITABLE_STATUSES,
  RequestStatus,
} from './status-transitions';

export interface CreatedRequest {
  id: string;
  token: string;
  status: RequestStatus;
}

export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const notFound = () =>
  new AppException(
    'REQUEST_NOT_FOUND',
    HttpStatus.NOT_FOUND,
    'Solicitacao nao encontrada',
  );

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private readonly model: Model<Request>,
  ) {}

  async create({
    name,
    email,
    phone,
    description,
  }: CreateRequestDto): Promise<CreatedRequest> {
    const token = generateConsultationToken();
    const created = await this.model.create({
      name,
      email,
      phone,
      description,
      consultationTokenHash: hashConsultationToken(token),
    });
    return { id: String(created._id), token, status: created.status };
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

  async update(id: string, dto: UpdateRequestDto): Promise<DetailView> {
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
      'Solicitacao aprovada ou cancelada nao pode ser alterada',
    );
  }

  async changeStatus(id: string, next: RequestStatus): Promise<DetailView> {
    const current = await this.model.findById(id, { status: 1 }).lean();
    if (!current) throw notFound();

    if (!canTransition(current.status, next)) {
      throw new AppException(
        'INVALID_STATUS_TRANSITION',
        HttpStatus.CONFLICT,
        `Nao e possivel mudar de ${current.status} para ${next}`,
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
        'Status alterado por outra operacao',
      );
    }
    return toDetail(updated);
  }

  private async throwIfMissing(id: string): Promise<void> {
    if (!(await this.model.exists({ _id: id }))) throw notFound();
  }
}

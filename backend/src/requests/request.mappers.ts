import type { FileMeta, Request } from './schemas/request.schema';
import type { RequestStatus } from './status-transitions';

type RequestData = Pick<
  Request,
  | '_id'
  | 'name'
  | 'email'
  | 'phone'
  | 'description'
  | 'status'
  | 'files'
  | 'createdAt'
  | 'updatedAt'
>;

export interface PublicStatusView {
  id: string;
  status: RequestStatus;
  filesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItemView {
  id: string;
  name: string;
  status: RequestStatus;
  filesCount: number;
  createdAt: Date;
}

export interface FileView {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface DetailView {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: RequestStatus;
  files: FileView[];
  createdAt: Date;
  updatedAt: Date;
}

// listagem vem com projecao: filesCount calculado no Mongo, sem files
export type ListRow = Pick<Request, '_id' | 'name' | 'status' | 'createdAt'> & {
  filesCount: number;
};

export function toPublicStatus(
  r: Pick<RequestData, '_id' | 'status' | 'files' | 'createdAt' | 'updatedAt'>,
): PublicStatusView {
  return {
    id: String(r._id),
    status: r.status,
    filesCount: r.files.length,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function toListItem(r: ListRow): ListItemView {
  return {
    id: String(r._id),
    name: r.name,
    status: r.status,
    filesCount: r.filesCount,
    createdAt: r.createdAt,
  };
}

// sem `key`: a chave do S3 nunca sai da API
export function toFileView(f: FileMeta): FileView {
  return {
    id: String(f._id),
    originalName: f.originalName,
    mimeType: f.mimeType,
    size: f.size,
    uploadedAt: f.uploadedAt,
  };
}

export function toDetail(r: RequestData): DetailView {
  return {
    id: String(r._id),
    name: r.name,
    email: r.email,
    phone: r.phone,
    description: r.description,
    status: r.status,
    files: r.files.map(toFileView),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// Espelha os mappers de backend/src/rental-requests

export type RentalRequestStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "CANCELLED";

// datas chegam como string ISO 8601 (UTC)
export interface RentalRequestFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface RentalRequestDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: RentalRequestStatus;
  files: RentalRequestFile[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalRequestListItem {
  id: string;
  name: string;
  status: RentalRequestStatus;
  filesCount: number;
  createdAt: string;
}

export interface PublicStatus {
  id: string;
  status: RentalRequestStatus;
  filesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedRentalRequest {
  id: string;
  token: string;
  status: RentalRequestStatus;
}

export interface RentalRequestInput {
  name: string;
  email: string;
  phone: string;
  description: string;
}

export type RentalRequestUpdate = Partial<RentalRequestInput>;

export interface ListRentalRequestsParams {
  page?: number;
  limit?: number;
  status?: RentalRequestStatus;
  q?: string;
}

export interface SignedUrl {
  url: string;
  expiresIn: number;
}

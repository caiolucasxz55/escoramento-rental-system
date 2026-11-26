// Area admin: espelha controllers/admin-rental-requests.controller.ts
import type {
  ListRentalRequestsParams,
  Paginated,
  RentalRequestDetail,
  RentalRequestListItem,
  RentalRequestStatus,
  RentalRequestUpdate,
  SignedUrl,
} from "@/types";

import { apiFetch } from "./client";

const base = (id: string) => `/admin/requests/${encodeURIComponent(id)}`;

export function listRentalRequests(
  params: ListRentalRequestsParams = {},
): Promise<Paginated<RentalRequestListItem>> {
  return apiFetch("/admin/requests", { params: { ...params }, auth: true });
}

export function getRentalRequest(id: string): Promise<RentalRequestDetail> {
  return apiFetch(base(id), { auth: true });
}

export function updateRentalRequest(
  id: string,
  changes: RentalRequestUpdate,
): Promise<RentalRequestDetail> {
  return apiFetch(base(id), { method: "PATCH", body: changes, auth: true });
}

export function changeStatus(
  id: string,
  status: RentalRequestStatus,
): Promise<RentalRequestDetail> {
  return apiFetch(`${base(id)}/status`, {
    method: "PATCH",
    body: { status },
    auth: true,
  });
}

// adicionar/substituir/remover arquivo existem na API, mas a tela do admin so consulta
export function getFileUrl(id: string, fileId: string): Promise<SignedUrl> {
  return apiFetch(`${base(id)}/files/${encodeURIComponent(fileId)}/url`, {
    auth: true,
  });
}

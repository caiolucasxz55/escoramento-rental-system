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

export function addFiles(id: string, files: File[]): Promise<RentalRequestDetail> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  return apiFetch(`${base(id)}/files`, { method: "POST", formData, auth: true });
}

export function replaceFile(
  id: string,
  fileId: string,
  file: File,
): Promise<RentalRequestDetail> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch(`${base(id)}/files/${encodeURIComponent(fileId)}`, {
    method: "PUT",
    formData,
    auth: true,
  });
}

export function removeFile(id: string, fileId: string): Promise<void> {
  return apiFetch(`${base(id)}/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getFileUrl(id: string, fileId: string): Promise<SignedUrl> {
  return apiFetch(`${base(id)}/files/${encodeURIComponent(fileId)}/url`, {
    auth: true,
  });
}

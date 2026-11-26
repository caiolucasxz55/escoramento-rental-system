// Area publica: espelha controllers/public-rental-requests.controller.ts
import type {
  CreatedRentalRequest,
  PublicStatus,
  RentalRequestInput,
} from "@/types";

import { apiFetch } from "./client";

export const CONSULTATION_TOKEN_HEADER = "X-Consultation-Token";

export function createRentalRequest(
  input: RentalRequestInput,
  files: File[],
): Promise<CreatedRentalRequest> {
  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) formData.append(key, value);
  for (const file of files) formData.append("files", file);
  return apiFetch("/public/requests", { method: "POST", formData });
}

// token no header, nunca na URL
export function getPublicStatus(id: string, token: string): Promise<PublicStatus> {
  return apiFetch(`/public/requests/${encodeURIComponent(id)}/status`, {
    headers: { [CONSULTATION_TOKEN_HEADER]: token },
  });
}

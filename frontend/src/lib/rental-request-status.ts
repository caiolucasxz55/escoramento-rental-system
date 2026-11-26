import type { RentalRequestStatus } from "@/types";

// mesmo mapa do backend (rules/status-transitions.ts); o backend e a regra
const TRANSITIONS: Record<RentalRequestStatus, RentalRequestStatus[]> = {
  PENDING: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "CANCELLED"],
  APPROVED: [],
  CANCELLED: [],
};

export const STATUS_OPTIONS: RentalRequestStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "CANCELLED",
];

export const STATUS_LABEL: Record<RentalRequestStatus, string> = {
  PENDING: "Pendente",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovada",
  CANCELLED: "Cancelada",
};

// texto do botao que leva AO status
export const STATUS_ACTION_LABEL: Record<RentalRequestStatus, string> = {
  PENDING: "Voltar para pendente",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovar",
  CANCELLED: "Cancelar",
};

export function nextStatuses(status: RentalRequestStatus): RentalRequestStatus[] {
  return TRANSITIONS[status];
}

export function isFinal(status: RentalRequestStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function isStatus(value: string | null): value is RentalRequestStatus {
  return STATUS_OPTIONS.includes(value as RentalRequestStatus);
}

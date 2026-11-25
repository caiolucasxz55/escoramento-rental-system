export enum RequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

// estado final = lista vazia
export const TRANSITIONS: Readonly<
  Record<RequestStatus, readonly RequestStatus[]>
> = {
  [RequestStatus.PENDING]: [
    RequestStatus.UNDER_REVIEW,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.UNDER_REVIEW]: [
    RequestStatus.APPROVED,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.APPROVED]: [],
  [RequestStatus.CANCELLED]: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isFinal(status: RequestStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

// dados e arquivos so mudam nesses estados (H4)
export const EDITABLE_STATUSES: readonly RequestStatus[] = Object.values(
  RequestStatus,
).filter((status) => !isFinal(status));

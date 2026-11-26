export enum RentalRequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

// estado final = lista vazia
export const TRANSITIONS: Readonly<
  Record<RentalRequestStatus, readonly RentalRequestStatus[]>
> = {
  [RentalRequestStatus.PENDING]: [
    RentalRequestStatus.UNDER_REVIEW,
    RentalRequestStatus.CANCELLED,
  ],
  [RentalRequestStatus.UNDER_REVIEW]: [
    RentalRequestStatus.APPROVED,
    RentalRequestStatus.CANCELLED,
  ],
  [RentalRequestStatus.APPROVED]: [],
  [RentalRequestStatus.CANCELLED]: [],
};

export function canTransition(
  from: RentalRequestStatus,
  to: RentalRequestStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isFinal(status: RentalRequestStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

// dados e arquivos so mudam nesses estados (H4)
export const EDITABLE_STATUSES: readonly RentalRequestStatus[] = Object.values(
  RentalRequestStatus,
).filter((status) => !isFinal(status));

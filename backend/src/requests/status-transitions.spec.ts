import {
  canTransition,
  EDITABLE_STATUSES,
  isFinal,
  RequestStatus,
  TRANSITIONS,
} from './status-transitions';

const { PENDING, UNDER_REVIEW, APPROVED, CANCELLED } = RequestStatus;

// 16 combinacoes; so 4 validas
const CASES: Array<[RequestStatus, RequestStatus, boolean]> = [
  [PENDING, PENDING, false],
  [PENDING, UNDER_REVIEW, true],
  [PENDING, APPROVED, false],
  [PENDING, CANCELLED, true],
  [UNDER_REVIEW, PENDING, false],
  [UNDER_REVIEW, UNDER_REVIEW, false],
  [UNDER_REVIEW, APPROVED, true],
  [UNDER_REVIEW, CANCELLED, true],
  [APPROVED, PENDING, false],
  [APPROVED, UNDER_REVIEW, false],
  [APPROVED, APPROVED, false],
  [APPROVED, CANCELLED, false],
  [CANCELLED, PENDING, false],
  [CANCELLED, UNDER_REVIEW, false],
  [CANCELLED, APPROVED, false],
  [CANCELLED, CANCELLED, false],
];

describe('canTransition', () => {
  it.each(CASES)('%s -> %s = %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });

  it('a tabela cobre cada par origem x destino exatamente uma vez', () => {
    const statuses = Object.values(RequestStatus);
    const pairs = new Set(CASES.map(([from, to]) => `${from}->${to}`));

    expect(CASES).toHaveLength(statuses.length ** 2);
    expect(pairs.size).toBe(CASES.length);
  });
});

describe('isFinal', () => {
  it.each([
    [PENDING, false],
    [UNDER_REVIEW, false],
    [APPROVED, true],
    [CANCELLED, true],
  ])('%s = %s', (status, expected) => {
    expect(isFinal(status)).toBe(expected);
  });

  it('estados finais nao tem saida', () => {
    for (const status of [APPROVED, CANCELLED]) {
      expect(TRANSITIONS[status]).toHaveLength(0);
    }
  });
});

describe('EDITABLE_STATUSES', () => {
  it('sao exatamente os estados nao finais', () => {
    expect([...EDITABLE_STATUSES].sort()).toEqual(
      [PENDING, UNDER_REVIEW].sort(),
    );
  });
});

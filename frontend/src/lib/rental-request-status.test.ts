import { describe, expect, it } from "vitest";

import { isFinal, isStatus, nextStatuses, progressSteps } from "./rental-request-status";

describe("progressSteps", () => {
  const states = (status: Parameters<typeof progressSteps>[0]) =>
    progressSteps(status).map((s) => `${s.status}:${s.state}`);

  it("PENDING: primeira etapa atual", () => {
    expect(states("PENDING")).toEqual([
      "PENDING:current",
      "UNDER_REVIEW:upcoming",
      "APPROVED:upcoming",
    ]);
  });

  it("UNDER_REVIEW: segunda etapa atual", () => {
    expect(states("UNDER_REVIEW")).toEqual([
      "PENDING:done",
      "UNDER_REVIEW:current",
      "APPROVED:upcoming",
    ]);
  });

  it("APPROVED: tudo concluido", () => {
    expect(states("APPROVED")).toEqual(["PENDING:done", "UNDER_REVIEW:done", "APPROVED:done"]);
  });

  it("CANCELLED: trilha curta, sem afirmar que passou por analise", () => {
    expect(states("CANCELLED")).toEqual(["PENDING:done", "CANCELLED:done"]);
  });
});

describe("nextStatuses", () => {
  it.each([
    ["PENDING", ["UNDER_REVIEW", "CANCELLED"]],
    ["UNDER_REVIEW", ["APPROVED", "CANCELLED"]],
    ["APPROVED", []],
    ["CANCELLED", []],
  ] as const)("%s -> %j", (status, expected) => {
    expect(nextStatuses(status)).toEqual(expected);
  });
});

describe("isFinal", () => {
  it("so APPROVED e CANCELLED sao finais", () => {
    expect(isFinal("APPROVED")).toBe(true);
    expect(isFinal("CANCELLED")).toBe(true);
    expect(isFinal("PENDING")).toBe(false);
    expect(isFinal("UNDER_REVIEW")).toBe(false);
  });
});

describe("isStatus", () => {
  it("aceita so valores do enum (vem da query string)", () => {
    expect(isStatus("PENDING")).toBe(true);
    expect(isStatus("pending")).toBe(false);
    expect(isStatus(null)).toBe(false);
  });
});

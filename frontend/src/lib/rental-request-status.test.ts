import { describe, expect, it } from "vitest";

import { isFinal, isStatus, nextStatuses } from "./rental-request-status";

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

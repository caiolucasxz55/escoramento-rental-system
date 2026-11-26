import { describe, expect, it } from "vitest";

import { formatBytes, formatPhone } from "./format";

describe("formatBytes", () => {
  it.each([
    [512, "512 B"],
    [1536, "1.5 KB"],
    [5 * 1024 * 1024, "5.0 MB"],
  ])("%d -> %s", (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe("formatPhone", () => {
  it.each([
    ["11987654321", "(11) 98765-4321"],
    ["1133334444", "(11) 3333-4444"],
    ["5511987654321", "5511987654321"],
  ])("%s -> %s", (digits, expected) => {
    expect(formatPhone(digits)).toBe(expected);
  });
});

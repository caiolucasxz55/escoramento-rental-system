import { describe, expect, it } from "vitest";

import { formatBytes, formatPhone, maskPhoneInput, phoneHref } from "./format";

describe("phoneHref", () => {
  it("sem DDI assume +55; com DDI usa os digitos", () => {
    expect(phoneHref("11987654321")).toBe("tel:+5511987654321");
    expect(phoneHref("1133334444")).toBe("tel:+551133334444");
    expect(phoneHref("5511987654321")).toBe("tel:+5511987654321");
  });
});

describe("maskPhoneInput", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["119", "(11) 9"],
    ["1198765", "(11) 9876-5"],
    ["1133334444", "(11) 3333-4444"],
    ["11987654321", "(11) 98765-4321"],
    ["(11) 98765-4321", "(11) 98765-4321"],
    ["5511987654321", "5511987654321"],
    ["55119876543210000", "5511987654321"],
  ])("%p -> %p", (input, expected) => {
    expect(maskPhoneInput(input)).toBe(expected);
  });
});

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

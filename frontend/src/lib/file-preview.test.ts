import { describe, expect, it } from "vitest";

import { previewKind } from "./file-preview";

describe("previewKind", () => {
  it.each([
    ["application/pdf", "pdf"],
    ["image/png", "image"],
    ["image/jpeg", "image"],
  ])("%s -> %s", (mimeType, expected) => {
    expect(previewKind(mimeType)).toBe(expected);
  });

  it.each(["text/html", "image/svg+xml", "application/octet-stream", ""])(
    "%p nao tem preview",
    (mimeType) => {
      expect(previewKind(mimeType)).toBeNull();
    },
  );
});

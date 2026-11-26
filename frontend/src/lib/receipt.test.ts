import { describe, expect, it } from "vitest";

import { buildReceipt, receiptFilename } from "./receipt";

const created = { id: "6b08809539d6de13ca52b57a", token: "hHyyPGhSpDcv", status: "PENDING" as const };

describe("buildReceipt", () => {
  const text = buildReceipt(created, "http://localhost:3000/status", new Date("2026-11-26T15:30:00"));

  it("traz identificador, token e onde consultar", () => {
    expect(text).toContain("Identificador: 6b08809539d6de13ca52b57a");
    expect(text).toContain("Token de consulta: hHyyPGhSpDcv");
    expect(text).toContain("acesse http://localhost:3000/status");
  });

  it("data no formato brasileiro e quebra de linha do Windows", () => {
    expect(text).toContain("Enviada em: 26/11/2026");
    expect(text.split("\r\n").length).toBeGreaterThan(5);
  });
});

describe("receiptFilename", () => {
  it("leva o identificador no nome", () => {
    expect(receiptFilename(created.id)).toBe("comprovante-solicitacao-6b08809539d6de13ca52b57a.txt");
  });
});

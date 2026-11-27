import { describe, expect, it } from "vitest";

import { validateFiles } from "./file-rules";

const file = (name: string, size = 1000) => ({ name, size });

describe("validateFiles", () => {
  it("aceita ate 5 arquivos PDF, PNG e JPEG", () => {
    expect(
      validateFiles([
        file("a.pdf"),
        file("b.PNG"),
        file("c.jpg"),
        file("d.jpeg"),
        file("e.pdf"),
      ]),
    ).toBeNull();
  });

  it("recusa o 6o arquivo", () => {
    expect(validateFiles(Array.from({ length: 6 }, () => file("a.pdf")))).toMatch(
      /no máximo 5/,
    );
  });

  it("recusa tipo fora da lista", () => {
    expect(validateFiles([file("planilha.xlsx")])).toMatch(/não é PDF/);
  });

  it("recusa acima de 10 MB e aceita exatamente 10 MB", () => {
    const tenMb = 10 * 1024 * 1024;
    expect(validateFiles([file("grande.pdf", tenMb + 1)])).toMatch(/10 MB/);
    expect(validateFiles([file("limite.pdf", tenMb)])).toBeNull();
  });

  it("recusa arquivo vazio", () => {
    expect(validateFiles([file("vazio.pdf", 0)])).toMatch(/vazio/);
  });

  describe("limite total por envio (producao: Lambda)", () => {
    const MB = 1024 * 1024;
    const prod = { maxFileMb: 4, maxTotalMb: 4 };

    it("soma acima do teto e recusada, mesmo com cada arquivo dentro do limite", () => {
      expect(validateFiles([file("a.pdf", 3 * MB), file("b.pdf", 2 * MB)], prod)).toMatch(
        /somam 5,0 MB; o limite é 4 MB por envio/,
      );
    });

    it("dentro do teto passa", () => {
      expect(validateFiles([file("a.pdf", 2 * MB), file("b.pdf", 2 * MB)], prod)).toBeNull();
    });

    it("sem teto (padrao local) so vale o limite por arquivo", () => {
      expect(validateFiles([file("a.pdf", 9 * MB), file("b.pdf", 9 * MB)], { maxFileMb: 10 })).toBeNull();
    });
  });
});


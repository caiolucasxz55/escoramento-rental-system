import { describe, expect, it } from "vitest";

import { ApiError } from "./api/client";
import { errorMessage } from "./error-messages";

describe("errorMessage", () => {
  it("usa a mensagem do codigo, nao o texto do backend", () => {
    const error = new ApiError(415, "UNSUPPORTED_FILE_TYPE", "texto do backend");

    expect(errorMessage(error)).toMatch(/PDF, PNG ou JPEG/);
  });

  it("validacao mostra o detalhe vindo da API", () => {
    const error = new ApiError(400, "VALIDATION_ERROR", "email must be an email");

    expect(errorMessage(error)).toContain("email must be an email");
  });

  it("a tela pode sobrescrever a mensagem de um codigo", () => {
    const error = new ApiError(404, "REQUEST_NOT_FOUND", "");

    expect(errorMessage(error, { REQUEST_NOT_FOUND: "nao achei" })).toBe("nao achei");
  });

  it("erro desconhecido ou que nao e da API vira mensagem generica", () => {
    expect(errorMessage(new Error("boom"))).toBe("Não foi possível concluir a ação.");
    expect(errorMessage(new ApiError(418, "TEAPOT", ""))).toBe(
      "Não foi possível concluir a ação.",
    );
  });
});

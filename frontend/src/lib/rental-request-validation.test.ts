import { describe, expect, it } from "vitest";

import { hasErrors, validateRentalRequest } from "./rental-request-validation";

const VALID = {
  name: "Construtora Exemplo",
  email: "contato@exemplo.com",
  phone: "11987654321",
  description: "40 escoras por 30 dias",
};

describe("validateRentalRequest", () => {
  it("dados validos: sem erros", () => {
    expect(hasErrors(validateRentalRequest(VALID))).toBe(false);
  });

  it("descricao curta conta sem os espacos das pontas, como o backend", () => {
    expect(validateRentalRequest({ ...VALID, description: "   curta      " })).toEqual({
      description: "A descrição deve ter entre 10 e 2000 caracteres.",
    });
  });

  it("um erro em portugues por campo invalido", () => {
    expect(validateRentalRequest({ name: " a ", email: "nao-e-email", phone: "1199", description: "" })).toEqual({
      name: "O nome deve ter entre 2 e 120 caracteres.",
      email: "Informe um e-mail válido.",
      phone: "O telefone deve ter de 10 a 13 dígitos, com DDD.",
      description: "A descrição deve ter entre 10 e 2000 caracteres.",
    });
  });

  it("telefone com mascara vale pelos digitos", () => {
    expect(validateRentalRequest({ ...VALID, phone: "(11) 98765-4321" })).toEqual({});
  });
});

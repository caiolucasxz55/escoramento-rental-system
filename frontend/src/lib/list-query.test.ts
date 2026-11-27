import { describe, expect, it } from "vitest";

import { pageRange, parseListQuery, toQueryString } from "./list-query";

describe("pageRange", () => {
  it.each([
    [{ page: 1, limit: 10, total: 35 }, { from: 1, to: 10, total: 35 }],
    [{ page: 4, limit: 10, total: 35 }, { from: 31, to: 35, total: 35 }],
    [{ page: 1, limit: 10, total: 0 }, { from: 0, to: 0, total: 0 }],
    [{ page: 9, limit: 10, total: 35 }, { from: 35, to: 35, total: 35 }],
  ])("%j -> %j", (meta, expected) => {
    expect(pageRange(meta)).toEqual(expected);
  });
});

const params = (qs: string) => new URLSearchParams(qs);

describe("parseListQuery", () => {
  it("le pagina e status validos", () => {
    expect(parseListQuery(params("page=2&status=PENDING"))).toEqual({
      page: 2,
      status: "PENDING",
    });
  });

  it.each(["page=0", "page=-3", "page=abc", "page=1.5", ""])(
    "pagina invalida (%s) vira 1",
    (qs) => {
      expect(parseListQuery(params(qs)).page).toBe(1);
    },
  );

  it("status fora do enum e ignorado", () => {
    expect(parseListQuery(params("status=FOO")).status).toBeUndefined();
  });
});

describe("toQueryString", () => {
  it("omite pagina 1 e filtro vazio", () => {
    expect(toQueryString({ page: 1 })).toBe("");
  });

  it("monta status e pagina", () => {
    expect(toQueryString({ page: 2, status: "PENDING" })).toBe("?status=PENDING&page=2");
  });
});

describe("busca (q)", () => {
  it("le o termo sem espacos nas pontas", () => {
    expect(parseListQuery(params("q=%20joao%20&status=PENDING"))).toEqual({ page: 1, status: "PENDING", q: "joao" });
  });

  it.each(["q=a", "q=%20%20", `q=${"x".repeat(101)}`])("termo fora de 2 a 100 caracteres (%s) e ignorado", (qs) => {
    expect(parseListQuery(params(qs)).q).toBeUndefined();
  });

  it("vai para a URL junto do status e da pagina", () => {
    expect(toQueryString({ page: 2, status: "PENDING", q: "joão silva" })).toBe("?q=jo%C3%A3o+silva&status=PENDING&page=2");
  });
});

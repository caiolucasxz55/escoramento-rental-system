import { describe, expect, it } from "vitest";

import { parseListQuery, toQueryString } from "./list-query";

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

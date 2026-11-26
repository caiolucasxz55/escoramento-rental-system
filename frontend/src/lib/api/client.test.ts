import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch, onUnauthorized } from "./client";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("apiFetch", () => {
  const storage = new Map<string, string>();
  const unauthorized = vi.fn();
  let unsubscribe: () => void = () => {};
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    storage.clear();
    storage.set("escoramento_admin_token", "jwt-de-teste");
    vi.stubGlobal("fetch", fetchMock);
    unsubscribe = onUnauthorized(unauthorized);
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (k: string) => storage.get(k) ?? null,
        setItem: (k: string, v: string) => storage.set(k, v),
        removeItem: (k: string) => storage.delete(k),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    unauthorized.mockReset();
    unsubscribe();
  });

  it("monta a URL com a query e ignora parametros vazios", async () => {
    fetchMock.mockResolvedValue(json(200, { ok: true }));

    await apiFetch("/admin/requests", { params: { page: 2, status: undefined } });

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/admin\/requests\?page=2$/);
  });

  it("rota admin envia o Bearer guardado na sessao", async () => {
    fetchMock.mockResolvedValue(json(200, {}));

    await apiFetch("/admin/requests", { auth: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: "Bearer jwt-de-teste" });
  });

  it("rota publica nao envia token", async () => {
    fetchMock.mockResolvedValue(json(200, {}));

    await apiFetch("/public/requests/x/status");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("erro da API vira ApiError com status e code do corpo", async () => {
    fetchMock.mockResolvedValue(
      json(409, {
        statusCode: 409,
        error: "INVALID_STATUS_TRANSITION",
        message: "Nao e possivel",
        path: "/x",
        timestamp: "",
      }),
    );

    await expect(apiFetch("/x")).rejects.toMatchObject({
      status: 409,
      code: "INVALID_STATUS_TRANSITION",
    });
  });

  it("401 em rota admin limpa a sessao e avisa o handler", async () => {
    fetchMock.mockResolvedValue(json(401, { statusCode: 401, error: "UNAUTHORIZED", message: "" }));

    await expect(apiFetch("/admin/requests", { auth: true })).rejects.toBeInstanceOf(ApiError);

    expect(storage.has("escoramento_admin_token")).toBe(false);
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 do proprio login nao derruba sessao nem redireciona", async () => {
    fetchMock.mockResolvedValue(
      json(401, { statusCode: 401, error: "INVALID_CREDENTIALS", message: "" }),
    );

    await expect(apiFetch("/auth/login", { method: "POST", body: {} })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(unauthorized).not.toHaveBeenCalled();
  });

  it("falha de rede vira NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiFetch("/x")).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("204 devolve undefined", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/x", { method: "DELETE" })).resolves.toBeUndefined();
  });
});

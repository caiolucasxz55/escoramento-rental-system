import { afterEach, describe, expect, it, vi } from "vitest";

import { demoCredentials } from "./demo-credentials";

describe("demoCredentials", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("devolve e-mail e senha quando as duas variaveis existem", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_ADMIN_EMAIL", "admin@escoramento.local");
    vi.stubEnv("NEXT_PUBLIC_DEMO_ADMIN_PASSWORD", "admin123");

    expect(demoCredentials()).toEqual({ email: "admin@escoramento.local", password: "admin123" });
  });

  it.each([
    ["sem nenhuma", "", ""],
    ["so o e-mail", "admin@escoramento.local", ""],
    ["so a senha", "", "admin123"],
  ])("%s: nao mostra o aviso", (_label, email, password) => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_ADMIN_EMAIL", email);
    vi.stubEnv("NEXT_PUBLIC_DEMO_ADMIN_PASSWORD", password);

    expect(demoCredentials()).toBeNull();
  });
});

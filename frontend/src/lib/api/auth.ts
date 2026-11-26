import type { LoginInput, LoginResult } from "@/types";

import { apiFetch } from "./client";

export function login(input: LoginInput): Promise<LoginResult> {
  return apiFetch("/auth/login", { method: "POST", body: input });
}

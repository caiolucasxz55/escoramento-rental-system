"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { browser } from "react-dom";

import { authApi } from "@/lib/api";
import { onUnauthorized } from "@/lib/api/client";
import { clearToken, getToken, setToken } from "@/lib/session";
import type { LoginInput } from "@/types";

interface AdminSession {
  token: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

const AdminSessionContext = createContext<AdminSession | null>(null);

// precisa de <Suspense> acima: le sessionStorage, que so existe no navegador
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  use(browser("A sessão do admin fica no sessionStorage."));
  const [token, setTokenState] = useState(getToken);

  const login = useCallback(async (input: LoginInput) => {
    const { accessToken } = await authApi.login(input);
    setToken(accessToken);
    setTokenState(accessToken);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  // 401 em qualquer chamada admin: sem token o AdminGuard leva ao login
  useEffect(() => onUnauthorized(() => setTokenState(null)), []);

  const value = useMemo(() => ({ token, login, logout }), [token, login, logout]);
  return <AdminSessionContext value={value}>{children}</AdminSessionContext>;
}

export function useAdminSession(): AdminSession {
  const session = use(AdminSessionContext);
  if (!session) throw new Error("useAdminSession fora do AdminSessionProvider");
  return session;
}

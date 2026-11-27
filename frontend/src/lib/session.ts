// JWT do admin em sessionStorage: morre com a aba. Trade-off (XSS) no README.
const TOKEN_KEY = "escoramento_admin_token";

// storage bloqueado (aba privada, politica) lanca na leitura: trata como sem sessao
export function getToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sem storage a sessao dura ate recarregar
  }
}

export function clearToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage bloqueado: nao ha o que limpar
  }
}

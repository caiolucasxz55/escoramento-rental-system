import { clearToken, getToken } from "@/lib/session";
import type { ApiErrorBody } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
export const ADMIN_LOGIN_PATH = "/admin/login";

// `code` e o campo `error` da API: estavel, a tela decide a mensagem por ele
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type QueryParams = Record<string, string | number | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // multipart: o navegador gera o boundary, entao sem Content-Type
  formData?: FormData;
  params?: QueryParams;
  headers?: Record<string, string>;
  // rota admin: envia o Bearer e trata 401 como sessao encerrada
  auth?: boolean;
}

function buildUrl(path: string, params?: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return `${API_URL}${path}${qs ? `?${qs}` : ""}`;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiErrorBody).error === "string"
  );
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  if (isErrorBody(body)) {
    return new ApiError(response.status, body.error, body.message);
  }
  return new ApiError(response.status, "HTTP_ERROR", response.statusText);
}

// quem decide o que fazer (voltar ao login) e o AdminSessionProvider
let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(handler: () => void): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

function endSession(): void {
  clearToken();
  unauthorizedHandler?.();
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, formData, params, headers = {}, auth = false }: RequestOptions = {},
): Promise<T> {
  const finalHeaders: Record<string, string> = { ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: finalHeaders,
      body: requestBody,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Falha de conexão com a API");
  }

  if (!response.ok) {
    const error = await toApiError(response);
    if (auth && response.status === 401) endSession();
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  CreatePasswordRequest,
  PasswordCreatedResponse,
  PasswordListResponse,
  PasswordDetailResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  DeletePasswordResponse,
  PasswordSummary,
} from "@/types/api.ts";

// Define um fallback seguro (relativo) caso a variável não exista no .env
const rawBase = import.meta.env.VITE_API_BASE || "/api";

if (rawBase === "/api") {
  console.warn("⚠️ VITE_API_BASE não definida. Utilizando o fallback padrão: '/api'. Certifique-se de que o proxy do Vite está configurado.");
}

// Configurações de normalização da URL base da API para garantir consistência e evitar erros comuns de formatação
export const normalizeApiBase = (base: string): string => {
  // Remoção de espaços em branco e barras finais para evitar problemas de concatenação
  const trimmed = base.trim().replace(/\/+$/, "");

  // Verificação simples para URLs absolutas (com http:// ou https://)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Caminho relativo que começa com "/"
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Se for um domínio puro do ngrok sem protocolo, assume HTTPS por segurança
  return `https://${trimmed}`;
};


const API_BASE_URL = normalizeApiBase(rawBase);
const REQUEST_TIMEOUT_MS = 15000;
const CSRF_HEADER_NAME = import.meta.env.VITE_CSRF_HEADER_NAME ?? "X-CSRF-Token";
const CSRF_BOOTSTRAP_ENDPOINT = import.meta.env.VITE_CSRF_ENDPOINT ?? "/csrf-token";
const DEFAULT_CSRF_COOKIE_NAMES = ["XSRF-TOKEN", "CSRF-TOKEN", "csrf-token", "_csrf"];
const CSRF_COOKIE_NAMES = (
  import.meta.env.VITE_CSRF_COOKIE_NAMES?.split(",").map((name: string) => name.trim()).filter(Boolean) ??
  DEFAULT_CSRF_COOKIE_NAMES
);

let inMemoryAccessToken: string | null = null;
let inMemoryCsrfToken: string | null = null;
let csrfBootstrapPromise: Promise<void> | null = null;

type ApiErrorHandlers = {
  onUnauthorized?: (error: ApiError) => void;
  onRateLimited?: (error: ApiError) => void;
  onServerError?: (error: ApiError) => void;
  onApiError?: (error: ApiError) => void;
};

let apiErrorHandlers: ApiErrorHandlers = {};

export function setApiErrorHandlers(handlers: ApiErrorHandlers | null) {
  apiErrorHandlers = handlers ?? {};
}

export class ApiError extends Error {
  status: number;
  code: string;
  retryAfter?: number;
  payload: unknown;

  constructor({
    status,
    message,
    code,
    retryAfter,
    payload,
  }: {
    status: number;
    message: string;
    code: string;
    retryAfter?: number;
    payload: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
    this.payload = payload;
  }
}

function mapStatusToCode(status: number): string {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER_ERROR";
  return "API_ERROR";
}

function fallbackMessageByStatus(status: number): string {
  if (status === 400) return "Dados inválidos.";
  if (status === 401) return "Sessão expirada. Faça login novamente.";
  if (status === 403) return "Você não tem permissão para executar esta ação.";
  if (status === 404) return "Recurso não encontrado.";
  if (status === 409) return "Conflito de dados.";
  if (status === 429) return "Muitas requisições. Tente novamente em instantes.";
  if (status >= 500) return "Erro interno no servidor. Tente novamente.";
  return "Erro inesperado";
}

export function getApiErrorMessage(payload: unknown, fallback = "Erro inesperado"): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function isUnsafeMethod(method: string | undefined): boolean {
  if (!method) return false;
  const normalizedMethod = method.toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod);
}

function getHeaderValueCaseInsensitive(
  headers: Record<string, string>,
  headerName: string
): string | undefined {
  const target = headerName.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return undefined;
}

function readCookie(cookieName: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function readCsrfTokenFromCookies(): string | null {
  for (const cookieName of CSRF_COOKIE_NAMES) {
    const value = readCookie(cookieName);
    if (value) return value;
  }
  return null;
}

function extractCsrfTokenFromPayload(payload: unknown): string | null {
  const data = asObject(payload);
  if (!data) return null;

  const csrfValue = data.csrfToken ?? data.csrf ?? data.token;
  if (typeof csrfValue === "string" && csrfValue.trim()) {
    return csrfValue;
  }

  return null;
}

function isLikelyCsrfError(status: number, payload: unknown): boolean {
  if (status !== 403) return false;

  const message = getApiErrorMessage(payload, "").toLowerCase();
  return message.includes("csrf") || message.includes("invalid token") || message.includes("forbidden");
}

function syncCsrfTokenFromResponse(response: Response, payload: unknown) {
  const headerToken = response.headers.get(CSRF_HEADER_NAME);
  if (headerToken && headerToken.trim()) {
    inMemoryCsrfToken = headerToken;
    return;
  }

  const payloadToken = extractCsrfTokenFromPayload(payload);
  if (payloadToken) {
    inMemoryCsrfToken = payloadToken;
    return;
  }

  const cookieToken = readCsrfTokenFromCookies();
  if (cookieToken) {
    inMemoryCsrfToken = cookieToken;
  }
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function triggerGlobalErrorHandlers(error: ApiError, skipGlobalErrorHandler: boolean) {
  if (skipGlobalErrorHandler) return;

  if (error.status === 401) {
    apiErrorHandlers.onUnauthorized?.(error);
  }

  if (error.status === 429) {
    apiErrorHandlers.onRateLimited?.(error);
  }

  if (error.status >= 500) {
    apiErrorHandlers.onServerError?.(error);
  }

  apiErrorHandlers.onApiError?.(error);
}

function normalizePasswordSummary(payload: unknown): PasswordSummary {
  const data = asObject(payload);
  if (!data) {
    throw new Error("Resposta inválida da API para credencial.");
  }

  const rawId = data.id ?? data._id;
  if (typeof rawId !== "string" || !rawId.trim()) {
    throw new Error("Credencial sem identificador válido.");
  }

  const serviceName = typeof data.serviceName === "string" ? data.serviceName : "";
  if (!serviceName.trim()) {
    throw new Error("Credencial sem nome de serviço válido.");
  }

  return {
    id: rawId,
    serviceName,
    usernameAccount: typeof data.usernameAccount === "string" ? data.usernameAccount : null,
    notes: typeof data.notes === "string" ? data.notes : null,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function normalizePasswordDetail(payload: unknown): PasswordDetailResponse {
  const summary = normalizePasswordSummary(payload);
  const data = asObject(payload);

  return {
    ...summary,
    password: data && typeof data.password === "string" ? data.password : "",
  };
}

export function setAccessToken(token: string | null | undefined) {
  inMemoryAccessToken = token ?? null;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}

export function setCsrfToken(token: string | null | undefined) {
  inMemoryCsrfToken = token ?? null;
}

export function clearCsrfToken() {
  inMemoryCsrfToken = null;
}

export async function bootstrapCsrfToken(forceRefresh = false) {
  const existingToken = inMemoryCsrfToken ?? readCsrfTokenFromCookies();
  if (!forceRefresh && existingToken) return;

  if (!forceRefresh && csrfBootstrapPromise) {
    await csrfBootstrapPromise;
    return;
  }

  csrfBootstrapPromise = request<unknown>(
    CSRF_BOOTSTRAP_ENDPOINT,
    { method: "GET" },
    { skipGlobalErrorHandler: true }
  )
    .then(() => undefined)
    .finally(() => {
      csrfBootstrapPromise = null;
    });

  await csrfBootstrapPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: { skipGlobalErrorHandler?: boolean; csrfRetryAttempted?: boolean } = {}
): Promise<T> {
  const { skipGlobalErrorHandler = false, csrfRetryAttempted = false } = config;
  const method = options.method?.toUpperCase() ?? "GET";
  const unsafeMethod = isUnsafeMethod(method);

  let csrfToken = inMemoryCsrfToken ?? readCsrfTokenFromCookies();
  if (unsafeMethod && !csrfToken) {
    await bootstrapCsrfToken();
    csrfToken = inMemoryCsrfToken ?? readCsrfTokenFromCookies();
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body !== undefined && options.body !== null && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (inMemoryAccessToken) {
    headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }

  const csrfHeaderAlreadySet = getHeaderValueCaseInsensitive(headers, CSRF_HEADER_NAME);
  if (unsafeMethod && csrfToken && !csrfHeaderAlreadySet) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  }

  const sentCsrfToken = getHeaderValueCaseInsensitive(headers, CSRF_HEADER_NAME) ?? null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
      signal: controller.signal,
    });

    const data = await parseResponsePayload(response);
    syncCsrfTokenFromResponse(response, data);

    if (!response.ok) {
      if (unsafeMethod && !csrfRetryAttempted && isLikelyCsrfError(response.status, data)) {
        const refreshedCsrfToken = inMemoryCsrfToken ?? readCsrfTokenFromCookies();
        if (refreshedCsrfToken && refreshedCsrfToken !== sentCsrfToken) {
          return request<T>(endpoint, options, {
            skipGlobalErrorHandler,
            csrfRetryAttempted: true,
          });
        }
      }

      const message = getApiErrorMessage(data, fallbackMessageByStatus(response.status));
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;

      const apiError = new ApiError({
        status: response.status,
        message,
        code: mapStatusToCode(response.status),
        retryAfter: Number.isNaN(retryAfter) ? undefined : retryAfter,
        payload: data,
      });

      triggerGlobalErrorHandlers(apiError, skipGlobalErrorHandler);
      throw apiError;
    }

    if (data === null) {
      return {} as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      const timeoutError = new ApiError({
        status: 408,
        code: "TIMEOUT",
        message: "A requisição demorou demais. Tente novamente.",
        payload: null,
      });
      triggerGlobalErrorHandlers(timeoutError, skipGlobalErrorHandler);
      throw timeoutError;
    }

    const networkError = new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Falha de conexão com a API.",
      payload: null,
    });
    triggerGlobalErrorHandlers(networkError, skipGlobalErrorHandler);
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authApi = {
  bootstrapCsrf: () => bootstrapCsrfToken(),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>("/v1/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    request<LoginResponse>("/v1/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<LogoutResponse>("/v1/logout", {
      method: "POST",
    }),

  checkSession: async () => {
    try {
      await request<unknown[]>("/v1/passwords", { method: "GET" }, { skipGlobalErrorHandler: true });
      return { authenticated: true };
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return { authenticated: false };
      }
      throw error;
    }
  },
};

export const passwordsApi = {
  list: async () => {
    const data = await request<unknown[]>("/v1/passwordslist", {
      method: "GET",
    });
    return data.map((item) => normalizePasswordSummary(item)) as PasswordListResponse[];
  },

  create: async (data: CreatePasswordRequest) => {
    const created = await request<unknown>("/v1/passwordslist", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizePasswordSummary(created) as PasswordCreatedResponse;
  },

  getById: async (id: string) => {
    const data = await request<unknown>(`/v1/passwordslist/${id}`);
    return normalizePasswordDetail(data);
  },

  update: (id: string, data: UpdatePasswordRequest) =>
    request<UpdatePasswordResponse>(`/v1/passwordslist/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<DeletePasswordResponse>(`/v1/passwordslist/${id}`, {
      method: "DELETE",
    }),
};

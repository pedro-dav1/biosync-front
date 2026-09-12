import { API_BASE_URL, TOKEN_STORAGE_KEY } from "../config";
import type { CampoInvalido, CodigoErro, ErroPayload } from "./types";

/* ------------------------------------------------------------------ */
/* Token                                                               */
/* ------------------------------------------------------------------ */

/**
 * Mantemos o token em memória e espelhamos no localStorage, pra sobreviver
 * a um refresh de página. Não há rota de logout: descartar o token é o logout.
 */
let tokenEmMemoria: string | null = null;

export function getToken(): string | null {
  if (tokenEmMemoria) return tokenEmMemoria;
  try {
    tokenEmMemoria = localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // localStorage bloqueado (modo privado, iframe restrito) — segue em memória.
  }
  return tokenEmMemoria;
}

export function setToken(token: string | null) {
  tokenEmMemoria = token;
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignora */
  }
}

/* ------------------------------------------------------------------ */
/* Erro                                                                */
/* ------------------------------------------------------------------ */

/**
 * Erro de API com o código do backend preservado.
 *
 * Assim o front decide o comportamento pelo `codigo` (estável) em vez de
 * comparar strings de mensagem (que mudam).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: CodigoErro;
  readonly campos: CampoInvalido[];

  constructor(
    status: number,
    codigo: CodigoErro,
    mensagem: string,
    campos: CampoInvalido[] = []
  ) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
  }

  /** Mensagem pronta pra toast, já com o detalhe do primeiro campo inválido. */
  get mensagemUsuario(): string {
    if (this.campos.length) {
      const primeiro = this.campos[0];
      return `${this.message} (${primeiro.campo}: ${primeiro.detalhe})`;
    }
    return this.message;
  }
}

/** Erro de rede / API fora do ar — não chegou resposta HTTP. */
export class NetworkError extends Error {
  constructor(message = "Não foi possível falar com a API.") {
    super(message);
    this.name = "NetworkError";
  }
}

/* ------------------------------------------------------------------ */
/* Sessão expirada                                                     */
/* ------------------------------------------------------------------ */

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/**
 * Registrado uma vez pelo AuthProvider. Qualquer 401 em rota autenticada
 * cai aqui e derruba a sessão em um único ponto.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Serializado como JSON. */
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Rotas públicas (login) não mandam Authorization. */
  publico?: boolean;
  signal?: AbortSignal;
  /**
   * Aborta a requisição depois de X ms. Sem isso, uma consulta travada no
   * backend (ex.: Select AI) fica pendurada indefinidamente. O Chat usa um
   * valor bem mais alto que o padrão, porque consultas reais já levaram
   * ~75 segundos nos testes.
   */
  timeoutMs?: number;
}

/** Combina um AbortSignal externo (se houver) com um timeout interno. */
function combinarComTimeout(externo: AbortSignal | undefined, timeoutMs: number | undefined) {
  if (!timeoutMs) return externo;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  externo?.addEventListener("abort", () => controller.abort());
  // Limpa o timer assim que a requisição encerrar por qualquer motivo.
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  return controller.signal;
}

function montarUrl(path: string, query?: RequestOptions["query"]) {
  // Base explícita (window.location.origin): API_BASE_URL pode ser relativo
  // (ex.: "/api/v1", usado com o proxy do Vite) ou absoluto — funciona nos dois casos.
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== null && valor !== "") {
        url.searchParams.set(chave, String(valor));
      }
    }
  }
  return url.toString();
}

async function extrairErro(response: Response): Promise<ApiError> {
  let codigo: CodigoErro = "ERRO_DESCONHECIDO";
  let mensagem = `Falha na requisição (HTTP ${response.status}).`;
  let campos: CampoInvalido[] = [];

  try {
    const payload = (await response.json()) as Partial<ErroPayload>;
    if (payload?.erro) {
      codigo = payload.erro.codigo ?? codigo;
      mensagem = payload.erro.mensagem ?? mensagem;
      campos = payload.erro.campos ?? [];
    }
  } catch {
    // Resposta de erro sem JSON (proxy, 502 de infra). Mantém o texto genérico.
  }

  return new ApiError(response.status, codigo, mensagem, campos);
}

/** Chamada JSON. Lança ApiError ou NetworkError; nunca devolve erro no retorno. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, publico = false, signal, timeoutMs } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (!publico) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(montarUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combinarComTimeout(signal, timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }

  if (response.status === 401 && !publico) {
    setToken(null);
    onUnauthorized?.();
  }

  if (!response.ok) {
    throw await extrairErro(response);
  }

  // 204 No Content (desativação de usuário) não tem corpo.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** Download de arquivo (relatório em csv/xlsx). Devolve o Blob e o nome sugerido. */
export async function requestBlob(
  path: string,
  options: RequestOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const { method = "POST", body, query, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(montarUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }

  if (response.status === 401) {
    setToken(null);
    onUnauthorized?.();
  }
  if (!response.ok) throw await extrairErro(response);

  // Nome vem do Content-Disposition montado pela API.
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/i);

  return {
    blob: await response.blob(),
    filename: match?.[1] ?? "relatorio",
  };
}

/** Dispara o download no navegador a partir de um Blob. */
export function baixarBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
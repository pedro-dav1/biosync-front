import { request, requestBlob } from "./client";
import type {
  AlertaRequest,
  AlertaResponse,
  CargosResponse,
  ChatRequest,
  ChatResponse,
  DashboardsResponse,
  FormatoRelatorio,
  LoginRequest,
  LoginResponse,
  MetricasResponse,
  OrganizacoesResponse,
  RelatorioRequest,
  RelatorioResponse,
  UsuarioCreateRequest,
  UsuarioCreateResponse,
  UsuarioSessao,
  UsuarioUpdateRequest,
  UsuarioUpdateResponse,
  UsuariosListaParams,
  UsuariosListaResponse,
} from "./types";

/**
 * Uma função por rota documentada. Nenhum componente monta URL na mão:
 * se a rota mudar, muda aqui e em nenhum outro lugar.
 */

/* Autenticação — seção 3 */

export const auth = {
  login: (dados: LoginRequest) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: dados,
      publico: true,
    }),

  me: (signal?: AbortSignal) => request<UsuarioSessao>("/auth/me", { signal }),
};

/* Dashboard — seção 4 */

export const dashboards = {
  listar: (signal?: AbortSignal) =>
    request<DashboardsResponse>("/dashboards", { signal }),
};

/* Alertas — seção 5 (admin) */

export const alertas = {
  disparar: (dados: AlertaRequest) =>
    request<AlertaResponse>("/alertas", { method: "POST", body: dados }),
};

/* Relatórios — seção 6 */

export const relatorios = {
  metricas: (signal?: AbortSignal) =>
    request<MetricasResponse>("/relatorios/metricas", { signal }),

  /** formato: "json" — resultado renderizado na tela. */
  gerar: (dados: RelatorioRequest & { formato: "json" }, signal?: AbortSignal) =>
    request<RelatorioResponse>("/relatorios", {
      method: "POST",
      body: dados,
      signal,
    }),

  /** formato: "csv" | "xlsx" — arquivo montado pela API. */
  baixar: (
    dados: RelatorioRequest & { formato: Exclude<FormatoRelatorio, "json"> },
    signal?: AbortSignal
  ) => requestBlob("/relatorios", { method: "POST", body: dados, signal }),
};

/* Usuários — seção 7 (admin) */

export const usuarios = {
  listar: (params: UsuariosListaParams = {}, signal?: AbortSignal) =>
    request<UsuariosListaResponse>("/usuarios", {
      query: {
        busca: params.busca,
        pagina: params.pagina,
        tamanho: params.tamanho,
      },
      signal,
    }),

  criar: (dados: UsuarioCreateRequest) =>
    request<UsuarioCreateResponse>("/usuarios", { method: "POST", body: dados }),

  editar: (id: number, dados: UsuarioUpdateRequest) =>
    request<UsuarioUpdateResponse>(`/usuarios/${id}`, {
      method: "PUT",
      body: dados,
    }),

  /** Soft delete: marca ativo = 0. Responde 204 sem corpo. */
  desativar: (id: number) =>
    request<void>(`/usuarios/${id}`, { method: "DELETE" }),
};

/* Dados de apoio — seção 8 (admin) */

export const apoio = {
  cargos: (signal?: AbortSignal) => request<CargosResponse>("/cargos", { signal }),
  organizacoes: (signal?: AbortSignal) =>
    request<OrganizacoesResponse>("/organizacoes", { signal }),
};

/* Chat — seção 9 */

export const chat = {
  perguntar: (dados: ChatRequest, signal?: AbortSignal) =>
    request<ChatResponse>("/chat", { method: "POST", body: dados, signal }),
};

export const api = { auth, dashboards, alertas, relatorios, usuarios, apoio, chat };

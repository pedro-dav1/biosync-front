/**
 * Contrato da API BioSync v1.
 *
 * Espelha a documentação de rotas. Se o backend mudar um campo, este é o
 * único arquivo que precisa mudar — o TypeScript aponta todos os lugares
 * afetados no front.
 */

/* ------------------------------------------------------------------ */
/* Erros (seção 2.3)                                                   */
/* ------------------------------------------------------------------ */

export interface CampoInvalido {
  campo: string;
  detalhe: string;
}

export interface ErroPayload {
  erro: {
    codigo: string;
    mensagem: string;
    campos?: CampoInvalido[];
  };
}

/** Códigos de erro documentados. `string` mantém a porta aberta pra novos. */
export type CodigoErro =
  | "CREDENCIAIS_INVALIDAS"
  | "VALIDACAO"
  | "ACESSO_NEGADO"
  | "FALHA_ENVIO_ALERTA"
  | "METRICA_DESCONHECIDA"
  | "PERIODO_INVALIDO"
  | "FALHA_LAKEHOUSE"
  | "CPF_DUPLICADO"
  | "EMAIL_DUPLICADO"
  | "TELEFONE_DUPLICADO"
  | "REFERENCIA_INVALIDA"
  | "USUARIO_NAO_ENCONTRADO"
  | "AUTO_DESATIVACAO"
  | "PERGUNTA_VAZIA"
  | "CONSULTA_NAO_PERMITIDA"
  | "FALHA_MODELO"
  | "FALHA_CONSULTA"
  | (string & {});

/* ------------------------------------------------------------------ */
/* Autenticação (seção 3)                                              */
/* ------------------------------------------------------------------ */

export interface UsuarioSessao {
  id_usuario: number;
  nome_completo: string;
  email: string;
  is_admin: boolean;
  cargo: string;
  organizacao: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  /** Segundos até expirar. */
  expira_em: number;
  usuario: UsuarioSessao;
}

/* ------------------------------------------------------------------ */
/* Dashboard (seção 4)                                                 */
/* ------------------------------------------------------------------ */

export interface DashboardAba {
  id_dashboard: number;
  nome_aba: string;
  /** Grafia conforme a documentação da API ("embbed"). */
  url_embbed: string;
}

export interface DashboardsResponse {
  abas: DashboardAba[];
}

/* ------------------------------------------------------------------ */
/* Alertas (seção 5)                                                   */
/* ------------------------------------------------------------------ */

export interface AlertaRequest {
  /** 1 a 500 caracteres. */
  mensagem: string;
  /** 2 letras maiúsculas. */
  estado_uf: string;
}

export interface AlertaResponse {
  id_alerta: number;
  estado_uf_destino: string;
  destinatarios: number;
  criado_em: string;
}

/* ------------------------------------------------------------------ */
/* Relatórios (seção 6)                                                */
/* ------------------------------------------------------------------ */

export interface Metrica {
  id_metrica: number;
  nome: string;
  descricao: string;
}

export interface MetricasResponse {
  metricas: Metrica[];
}

export interface MetricaSelecionada {
  id_metrica: number;
  /** Ex.: UF. `null` quando a métrica é nacional. */
  filtro?: string | null;
}

export type FormatoRelatorio = "json" | "csv" | "xlsx";

export interface RelatorioRequest {
  metricas: MetricaSelecionada[];
  periodo: {
    /** YYYY-MM-DD */
    inicio: string;
    /** YYYY-MM-DD */
    fim: string;
  };
  formato: FormatoRelatorio;
}

export interface ResultadoMetrica {
  id_metrica: number;
  nome: string;
  filtro: string | null;
  valor: number;
  unidade: "numero" | "percentual" | (string & {});
}

export interface RelatorioResponse {
  gerado_em: string;
  periodo: { inicio: string; fim: string };
  resultados: ResultadoMetrica[];
}

/* ------------------------------------------------------------------ */
/* Usuários (seção 7)                                                  */
/* ------------------------------------------------------------------ */

export interface CargoRef {
  id_cargo: number;
  nome_cargo: string;
}

export interface OrganizacaoRef {
  id_organizacao: number;
  /** A doc usa "nome" na listagem de usuários e "nome_organizacao" em /organizacoes. */
  nome?: string;
  nome_organizacao?: string;
}

export interface UsuarioListaItem {
  id_usuario: number;
  nome_completo: string;
  email: string;
  telefone: string;
  is_admin: boolean;
  cargo: CargoRef;
  organizacao: OrganizacaoRef;
}

export interface UsuariosListaResponse {
  total: number;
  pagina: number;
  tamanho: number;
  itens: UsuarioListaItem[];
}

export interface UsuariosListaParams {
  /** Trecho do nome completo. A busca é feita pelo backend (LIKE). */
  busca?: string;
  pagina?: number;
  /** Máximo 100. */
  tamanho?: number;
}

export interface Endereco {
  tipo_logradouro: string;
  logradouro: string;
  numero: number;
  cep?: string;
  estado_uf: string;
  cidade: string;
  complemento?: string;
}

export interface UsuarioCreateRequest {
  /** 11 dígitos, único. Imutável depois de criado. */
  cpf: string;
  email: string;
  /** Só dígitos, com DDD. */
  telefone: string;
  /** Mínimo 8 caracteres. */
  senha: string;
  nome: string;
  sobrenome: string;
  is_admin: boolean;
  cargo_id: number;
  organizacao_id: number;
  endereco: Endereco;
}

/** No PUT a senha é opcional e o CPF é ignorado pelo backend. */
export type UsuarioUpdateRequest = Omit<UsuarioCreateRequest, "senha" | "cpf"> & {
  senha?: string;
};

export interface UsuarioCreateResponse {
  id_usuario: number;
  nome_completo: string;
  email: string;
  criado_em: string;
}

export interface UsuarioUpdateResponse {
  id_usuario: number;
  nome_completo: string;
  email: string;
  atualizado_em: string;
}

/* ------------------------------------------------------------------ */
/* Dados de apoio (seção 8)                                            */
/* ------------------------------------------------------------------ */

export interface CargosResponse {
  itens: CargoRef[];
}

export interface OrganizacoesResponse {
  itens: Array<{ id_organizacao: number; nome_organizacao: string }>;
}

/* ------------------------------------------------------------------ */
/* Chat (seção 9)                                                      */
/* ------------------------------------------------------------------ */

export interface ChatRequest {
  pergunta: string;
}

export interface ChatResponse {
  resposta: string;
  /** Devolvido pra auditoria. Pode não ser exibido na interface. */
  sql_executado: string;
  linhas_retornadas: number;
  tempo_ms: number;
}

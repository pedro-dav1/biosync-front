/**
 * Configuração de ambiente.
 *
 * Em desenvolvimento, crie um arquivo `.env.local` na raiz com:
 *   VITE_API_BASE_URL=http://localhost:8000/api/v1
 *
 * O fallback aponta para localhost pra o front subir sem configuração.
 */
export const API_BASE_URL: string =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

/** Chave usada pra guardar o JWT. Não existe rota de logout: o front descarta o token. */
export const TOKEN_STORAGE_KEY = "biosyn.access_token";

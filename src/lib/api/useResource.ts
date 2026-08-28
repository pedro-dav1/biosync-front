import { useCallback, useEffect, useState } from "react";
import { ApiError, NetworkError } from "./client";

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  /** Mensagem pronta pra exibir. `null` quando não houve erro. */
  error: string | null;
  /** Código do backend, pra tratar caso específico (ex.: ACESSO_NEGADO). */
  codigo: string | null;
  refetch: () => void;
}

/** Traduz qualquer exceção da camada de API numa mensagem exibível. */
export function mensagemDeErro(error: unknown): string {
  if (error instanceof ApiError) return error.mensagemUsuario;
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erro inesperado.";
}

/**
 * Busca dados na montagem e expõe loading/error/refetch.
 *
 * `fetcher` recebe um AbortSignal — a requisição é cancelada se o
 * componente desmontar antes da resposta, evitando setState em componente
 * já removido.
 *
 * Importante: passe o `fetcher` estável (useCallback) ou deixe `deps`
 * cuidando de quando refazer a chamada.
 */
export function useResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = []
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const refetch = useCallback(() => setTentativa((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;

    setLoading(true);
    setError(null);
    setCodigo(null);

    fetcher(controller.signal)
      .then((resultado) => {
        if (!ativo) return;
        setData(resultado);
      })
      .catch((err) => {
        if (!ativo) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(mensagemDeErro(err));
        setCodigo(err instanceof ApiError ? err.codigo : null);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa]);

  return { data, loading, error, codigo, refetch };
}

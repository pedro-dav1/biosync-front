import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/endpoints";
import { getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { UsuarioSessao } from "../api/types";

interface AuthContextValue {
  usuario: UsuarioSessao | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  /** true enquanto o app tenta reidratar a sessão a partir do token salvo. */
  carregandoSessao: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  const logout = useCallback(() => {
    // Não há rota de logout na API: descartar o token encerra a sessão.
    setToken(null);
    setUsuario(null);
  }, []);

  // Qualquer 401 vindo de qualquer rota derruba a sessão por aqui.
  useEffect(() => {
    setUnauthorizedHandler(() => setUsuario(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Ao abrir o app, se existe token salvo, reidrata a sessão com GET /auth/me.
  useEffect(() => {
    const controller = new AbortController();

    if (!getToken()) {
      setCarregandoSessao(false);
      return;
    }

    api.auth
      .me(controller.signal)
      .then(setUsuario)
      .catch(() => {
        // Token expirado ou inválido: cai pro login sem barulho.
        setToken(null);
        setUsuario(null);
      })
      .finally(() => setCarregandoSessao(false));

    return () => controller.abort();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const resposta = await api.auth.login({ email, senha });
    setToken(resposta.access_token);
    setUsuario(resposta.usuario);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isLoggedIn: usuario !== null,
      isAdmin: usuario?.is_admin ?? false,
      carregandoSessao,
      login,
      logout,
    }),
    [usuario, carregandoSessao, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  }
  return context;
}

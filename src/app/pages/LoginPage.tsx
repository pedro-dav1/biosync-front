import { useState } from "react";
import { Logo } from "../components/Logo";
import { Lock, Mail, Shield, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../lib/auth/AuthContext";
import { mensagemDeErro } from "../../lib/api/useResource";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      // POST /auth/login — a API devolve a mesma mensagem genérica pra
      // e-mail inexistente, senha errada ou usuário inativo.
      await login(email, password);
    } catch (error) {
      setErro(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F2A] via-[#081419] to-[#0B1F2A]">
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#00FFA3] rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(0,255,163,0.2)] p-8 shadow-[0_0_60px_rgba(0,255,163,0.2)]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
              Centro de Comando
            </h1>
            <p className="text-sm text-[rgba(255,255,255,0.6)]">
              Inteligência em Saúde Pública
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)] mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.gov.br"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)] mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {erro && (
              <div className="flex items-start gap-3 rounded-lg border border-[rgba(255,59,92,0.4)] bg-[rgba(255,59,92,0.1)] p-4">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-[#FF3B5C]" />
                <p className="text-sm text-white">{erro}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold uppercase tracking-wider hover:shadow-[0_0_40px_rgba(0,255,163,0.5)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Autenticando..." : "Acessar Plataforma"}
            </button>

          </form>

          {/* LGPD Notice */}
          <div className="mt-8 pt-6 border-t border-[rgba(0,255,163,0.15)]">
            <p className="text-xs text-center text-[rgba(255,255,255,0.5)]">
              Ao acessar, você concorda com nossa{" "}
              <span className="text-[#00FFA3] underline cursor-pointer">Política de Privacidade</span>
              {" "}e está em conformidade com a LGPD
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)]">
            <Shield size={14} className="text-[#00FFA3]" />
            <span className="text-xs text-[rgba(255,255,255,0.7)]">
              Conexão segura • Certificado SSL
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

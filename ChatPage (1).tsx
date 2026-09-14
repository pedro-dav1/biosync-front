import { useRef, useState } from "react";
import {
  Bot,
  Send,
  AlertTriangle,
  Loader2,
  Clock,
  Hash,
  User,
} from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { api } from "../../lib/api/endpoints";
import { ApiError } from "../../lib/api/client";
import { mensagemDeErro } from "../../lib/api/useResource";
import type { ChatResponse } from "../../lib/api/types";

interface Turno {
  id: string;
  pergunta: string;
  resposta?: ChatResponse;
  erro?: string;
}

const SUGESTOES = [
  "Quantas internações tivemos no total?",
  "Qual a idade média dos internados?",
  "Qual o valor médio por internação?",
];

/**
 * Chat em linguagem natural sobre o Select AI (Oracle).
 *
 * Sem histórico persistido e sem memória entre perguntas — cada pergunta é
 * uma chamada isolada a POST /chat. Consultas reais observadas levam até
 * ~75s (o Select AI gera SQL, executa no lakehouse e narra o resultado),
 * então a UI é honesta sobre isso: mostra o que está acontecendo, não finge
 * ser um chat instantâneo.
 */
export function ChatPage() {
  const [pergunta, setPergunta] = useState("");
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement | null>(null);

  const enviar = async (texto: string) => {
    const perguntaEnviada = texto.trim();
    if (!perguntaEnviada || enviando) return;

    const id = crypto.randomUUID();
    setTurnos((t) => [...t, { id, pergunta: perguntaEnviada }]);
    setPergunta("");
    setEnviando(true);

    try {
      const resposta = await api.chat.perguntar({ pergunta: perguntaEnviada });
      setTurnos((t) => t.map((turno) => (turno.id === id ? { ...turno, resposta } : turno)));
    } catch (e) {
      const msg = mensagemDeErro(e);
      setTurnos((t) => t.map((turno) => (turno.id === id ? { ...turno, erro: msg } : turno)));
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setEnviando(false);
      setTimeout(() => fimRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviar(pergunta);
  };

  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-wider text-white">
          <Bot size={30} className="text-[#6C5CE7]" />
          Assistente de Dados
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Pergunte em português • Select AI traduz para SQL e consulta o lakehouse em tempo real
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pb-4">
        {turnos.length === 0 && (
          <GlowCard>
            <p className="mb-4 text-sm text-[rgba(255,255,255,0.6)]">
              Nenhuma pergunta feita ainda. Algumas sugestões:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-full border border-[rgba(0,255,163,0.2)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-xs text-white transition-colors hover:border-[#00FFA3]"
                >
                  {s}
                </button>
              ))}
            </div>
          </GlowCard>
        )}

        {turnos.map((turno) => (
          <div key={turno.id} className="space-y-3">
            {/* Pergunta do usuário */}
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-xl rounded-2xl rounded-tr-sm bg-[rgba(108,92,231,0.18)] border border-[rgba(108,92,231,0.3)] px-4 py-3">
                <p className="text-sm text-white">{turno.pergunta}</p>
              </div>
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(108,92,231,0.25)]">
                <User size={15} className="text-[#6C5CE7]" />
              </div>
            </div>

            {/* Resposta */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(0,255,163,0.15)]">
                <Bot size={15} className="text-[#00FFA3]" />
              </div>

              {!turno.resposta && !turno.erro && (
                <div className="flex max-w-xl items-center gap-3 rounded-2xl rounded-tl-sm border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-[#00FFA3]" />
                  <div>
                    <p className="text-sm text-white">Consultando o lakehouse...</p>
                    <p className="mt-0.5 text-xs text-[rgba(255,255,255,0.45)]">
                      Pode levar até um minuto — o Select AI gera o SQL e executa a consulta.
                    </p>
                  </div>
                </div>
              )}

              {turno.erro && (
                <div className="flex max-w-xl items-start gap-3 rounded-2xl rounded-tl-sm border border-[rgba(255,59,92,0.4)] bg-[rgba(255,59,92,0.1)] px-4 py-3">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-[#FF3B5C]" />
                  <p className="text-sm text-white">{turno.erro}</p>
                </div>
              )}

              {turno.resposta && (
                <div className="max-w-xl space-y-2">
                  <div className="rounded-2xl rounded-tl-sm border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                    <p className="text-sm text-white">{turno.resposta.resposta}</p>
                  </div>

                  <div className="flex items-center gap-3 px-1 text-xs text-[rgba(255,255,255,0.4)]">
                    <span className="flex items-center gap-1">
                      <Hash size={11} />
                      {turno.resposta.linhas_retornadas} linha(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {(turno.resposta.tempo_ms / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={fimRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-shrink-0 gap-3 border-t border-[rgba(0,255,163,0.1)] pt-4">
        <input
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          disabled={enviando}
          placeholder="Pergunte algo sobre os dados de saúde pública..."
          className="flex-1 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={enviando || !pergunta.trim()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#0B1F2A] transition-all hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

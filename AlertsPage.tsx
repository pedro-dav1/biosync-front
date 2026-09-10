import { useState } from "react";
import { AlertTriangle, Send, Users, CheckCircle2, RotateCcw } from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { api } from "../../lib/api/endpoints";
import { ApiError } from "../../lib/api/client";
import { mensagemDeErro } from "../../lib/api/useResource";
import type { AlertaResponse } from "../../lib/api/types";

const LIMITE_MENSAGEM = 500;

const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS",
  "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC",
  "SE", "SP", "TO",
];

/**
 * Disparo de alerta por SMS, segmentado por UF.
 *
 * A API não tem histórico nem listagem de alertas — é uma ação única,
 * sem estado persistente do lado do front. Cada envio é independente.
 */
export function AlertsPage() {
  const [mensagem, setMensagem] = useState("");
  const [uf, setUf] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AlertaResponse | null>(null);

  const caracteresRestantes = LIMITE_MENSAGEM - mensagem.length;
  const podeEnviar = mensagem.trim().length > 0 && caracteresRestantes >= 0 && uf !== "" && !enviando;

  const handleEnviar = async () => {
    if (!podeEnviar) return;
    setEnviando(true);
    setErro(null);
    setResultado(null);
    try {
      const resposta = await api.alertas.disparar({ mensagem: mensagem.trim(), estado_uf: uf });
      setResultado(resposta);
    } catch (e) {
      // FALHA_ENVIO_ALERTA (502): o gateway de SMS recusou o lote — nada foi
      // registrado. Mostramos a mensagem real da API, não uma genérica.
      setErro(mensagemDeErro(e));
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setEnviando(false);
    }
  };

  const handleNovoAlerta = () => {
    setResultado(null);
    setErro(null);
    setMensagem("");
    setUf("");
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-wider text-white">
          <AlertTriangle size={30} className="text-[#FFB800]" />
          Central de Alertas
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Disparo de SMS segmentado por estado • Ação imediata, sem confirmação prévia
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <GlowCard>
          {resultado ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(0,255,163,0.12)]">
                <CheckCircle2 size={30} className="text-[#00FFA3]" />
              </div>
              <div>
                <p className="text-lg font-bold uppercase tracking-wide text-white">
                  Alerta registrado
                </p>
                <p className="mt-1 text-sm text-[rgba(255,255,255,0.6)]">
                  Destino: {resultado.estado_uf_destino} • Alerta nº {resultado.id_alerta}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.04)] px-5 py-3">
                <Users size={18} className="text-[#00D4FF]" />
                <span className="text-sm text-white">
                  {resultado.destinatarios === 0 ? (
                    <span className="text-[#FFB800]">
                      0 destinatários — nenhum usuário cadastrado nessa UF
                    </span>
                  ) : (
                    <>
                      <strong>{resultado.destinatarios.toLocaleString("pt-BR")}</strong> destinatário(s)
                      receberam o SMS
                    </>
                  )}
                </span>
              </div>

              <button
                onClick={handleNovoAlerta}
                className="mt-2 flex items-center gap-2 rounded-lg border border-[rgba(0,255,163,0.2)] bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-sm text-white transition-colors hover:border-[#00FFA3]"
              >
                <RotateCcw size={15} />
                Disparar novo alerta
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                    Mensagem
                  </label>
                  <span
                    className={`text-xs ${
                      caracteresRestantes < 0 ? "text-[#FF3B5C]" : "text-[rgba(255,255,255,0.4)]"
                    }`}
                  >
                    {caracteresRestantes} caracteres restantes
                  </span>
                </div>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={5}
                  placeholder="Escreva a mensagem que será enviada por SMS..."
                  className="w-full resize-none rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Estado de destino
                </label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white transition-colors focus:border-[#00FFA3] focus:outline-none"
                >
                  <option value="">Selecione a UF...</option>
                  {UFS.map((sigla) => (
                    <option key={sigla} value={sigla} className="bg-[#0B1F2A]">
                      {sigla}
                    </option>
                  ))}
                </select>
              </div>

              {erro && (
                <div className="flex items-start gap-3 rounded-lg border border-[rgba(255,59,92,0.4)] bg-[rgba(255,59,92,0.1)] p-4">
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-[#FF3B5C]" />
                  <div>
                    <p className="text-sm font-medium text-white">Não foi possível disparar o alerta</p>
                    <p className="mt-1 text-xs text-[rgba(255,255,255,0.7)]">{erro}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleEnviar}
                disabled={!podeEnviar}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FFB800] to-[#FF3B5C] py-3.5 text-sm font-bold uppercase tracking-wider text-[#0B1F2A] transition-all hover:shadow-[0_0_30px_rgba(255,184,0,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />
                {enviando ? "Enviando..." : "Disparar alerta"}
              </button>

              <p className="text-center text-xs text-[rgba(255,255,255,0.4)]">
                O disparo é imediato e não pode ser desfeito. Não existe histórico de alertas nesta versão.
              </p>
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}

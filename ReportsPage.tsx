import { useState } from "react";
import {
  FileText,
  Download,
  AlertTriangle,
  Loader2,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { api } from "../../lib/api/endpoints";
import { ApiError, baixarBlob } from "../../lib/api/client";
import { mensagemDeErro, useResource } from "../../lib/api/useResource";
import type {
  FormatoRelatorio,
  MetricasResponse,
  RelatorioResponse,
} from "../../lib/api/types";

const hoje = new Date().toISOString().slice(0, 10);
const seiseMesesAtras = new Date();
seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);
const dataInicialPadrao = seiseMesesAtras.toISOString().slice(0, 10);

function formatarValor(valor: number, unidade: string) {
  if (unidade === "percentual") return `${valor.toLocaleString("pt-BR")}%`;
  if (unidade === "moeda") {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return valor.toLocaleString("pt-BR");
}

/**
 * Geração de relatórios sob demanda.
 *
 * Não existe persistência: cada geração é uma chamada nova a
 * POST /relatorios. json renderiza na tela; csv/xlsx baixam como arquivo.
 *
 * A consulta roda sobre o lakehouse (Databricks) por trás — pode ser lenta
 * ou falhar com FALHA_LAKEHOUSE se o cluster estiver indisponível. Tratamos
 * esse erro de forma explícita, sem fingir que é um problema do formulário.
 */
export function ReportsPage() {
  const {
    data: catalogo,
    loading: carregandoCatalogo,
    error: erroCatalogo,
  } = useResource<MetricasResponse>((signal) => api.relatorios.metricas(signal), []);

  const metricas = catalogo?.metricas ?? [];

  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [inicio, setInicio] = useState(dataInicialPadrao);
  const [fim, setFim] = useState(hoje);
  const [gerando, setGerando] = useState<FormatoRelatorio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RelatorioResponse | null>(null);

  const toggleMetrica = (id: number) => {
    setResultado(null);
    setSelecionadas((prev) => {
      const nova = new Set(prev);
      nova.has(id) ? nova.delete(id) : nova.add(id);
      return nova;
    });
  };

  const periodoValido = inicio !== "" && fim !== "" && inicio <= fim;
  const podeGerar = selecionadas.size > 0 && periodoValido && gerando === null;

  const montarPayload = (formato: FormatoRelatorio) => ({
    metricas: Array.from(selecionadas).map((id_metrica) => ({ id_metrica })),
    periodo: { inicio, fim },
    formato,
  });

  const handleGerar = async () => {
    if (!podeGerar) return;
    setGerando("json");
    setErro(null);
    setResultado(null);
    try {
      const resposta = await api.relatorios.gerar(
        montarPayload("json") as Parameters<typeof api.relatorios.gerar>[0]
      );
      setResultado(resposta);
    } catch (e) {
      setErro(mensagemDeErro(e));
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setGerando(null);
    }
  };

  const handleExportar = async (formato: Exclude<FormatoRelatorio, "json">) => {
    if (!podeGerar) return;
    setGerando(formato);
    setErro(null);
    try {
      const payload = montarPayload(formato) as Parameters<typeof api.relatorios.baixar>[0];
      const { blob, filename } = await api.relatorios.baixar(payload);
      baixarBlob(blob, filename);
    } catch (e) {
      setErro(mensagemDeErro(e));
      if (!(e instanceof ApiError)) console.error(e);
    } finally {
      setGerando(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-wider text-white">
          <FileText size={30} className="text-[#00FFA3]" />
          Relatórios
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Selecione métricas e período • Gerado sob demanda, sem histórico salvo
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Seleção */}
        <GlowCard>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
            Métricas
          </h2>

          {carregandoCatalogo && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={22} className="animate-spin text-[#00FFA3]" />
            </div>
          )}

          {!carregandoCatalogo && erroCatalogo && (
            <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,59,92,0.3)] bg-[rgba(255,59,92,0.08)] p-4 text-sm text-white">
              <AlertTriangle size={16} className="flex-shrink-0 text-[#FF3B5C]" />
              {erroCatalogo}
            </div>
          )}

          {!carregandoCatalogo && !erroCatalogo && (
            <div className="space-y-2">
              {metricas.map((m) => {
                const marcada = selecionadas.has(m.id_metrica);
                return (
                  <button
                    key={m.id_metrica}
                    onClick={() => toggleMetrica(m.id_metrica)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                      marcada
                        ? "border-[#00FFA3] bg-[rgba(0,255,163,0.08)]"
                        : "border-[rgba(0,255,163,0.12)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(0,255,163,0.3)]"
                    }`}
                  >
                    {marcada ? (
                      <CheckSquare size={18} className="mt-0.5 flex-shrink-0 text-[#00FFA3]" />
                    ) : (
                      <Square size={18} className="mt-0.5 flex-shrink-0 text-[rgba(255,255,255,0.3)]" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{m.nome}</p>
                      <p className="mt-0.5 text-xs text-[rgba(255,255,255,0.5)]">{m.descricao}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </GlowCard>

        {/* Período + ações */}
        <div className="space-y-6">
          <GlowCard>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
              Período
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Início
                </label>
                <input
                  type="date"
                  value={inicio}
                  max={fim || undefined}
                  onChange={(e) => { setInicio(e.target.value); setResultado(null); }}
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-white transition-colors focus:border-[#00FFA3] focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Fim
                </label>
                <input
                  type="date"
                  value={fim}
                  min={inicio || undefined}
                  max={hoje}
                  onChange={(e) => { setFim(e.target.value); setResultado(null); }}
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-3 py-2.5 text-sm text-white transition-colors focus:border-[#00FFA3] focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>
            {!periodoValido && inicio && fim && (
              <p className="mt-2 text-xs text-[#FF3B5C]">A data inicial deve ser anterior à final.</p>
            )}
          </GlowCard>

          <GlowCard>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
              Gerar
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleGerar}
                disabled={!podeGerar}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] py-3 text-sm font-bold uppercase tracking-wider text-[#0B1F2A] transition-all hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {gerando === "json" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FileJson size={16} />
                )}
                {gerando === "json" ? "Consultando..." : "Ver na tela"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExportar("csv")}
                  disabled={!podeGerar}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,255,163,0.2)] bg-[rgba(255,255,255,0.05)] py-2.5 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:border-[#00FFA3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {gerando === "csv" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  CSV
                </button>
                <button
                  onClick={() => handleExportar("xlsx")}
                  disabled={!podeGerar}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,255,163,0.2)] bg-[rgba(255,255,255,0.05)] py-2.5 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:border-[#00FFA3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {gerando === "xlsx" ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                  Excel
                </button>
              </div>
            </div>

            {selecionadas.size === 0 && (
              <p className="mt-3 text-xs text-[rgba(255,255,255,0.4)]">
                Selecione ao menos uma métrica para gerar.
              </p>
            )}
          </GlowCard>

          {erro && (
            <div className="flex items-start gap-3 rounded-lg border border-[rgba(255,59,92,0.4)] bg-[rgba(255,59,92,0.1)] p-4">
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-[#FF3B5C]" />
              <div>
                <p className="text-sm font-medium text-white">Não foi possível gerar o relatório</p>
                <p className="mt-1 text-xs text-[rgba(255,255,255,0.7)]">{erro}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultado (formato json) */}
      {resultado && (
        <GlowCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-white">
              Resultado • {resultado.periodo.inicio} a {resultado.periodo.fim}
            </h2>
            <span className="text-xs text-[rgba(255,255,255,0.4)]">
              Gerado em {new Date(resultado.gerado_em).toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.resultados.map((r, i) => (
              <div
                key={`${r.id_metrica}-${i}`}
                className="rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.03)] p-4"
              >
                <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
                  {r.nome}
                  {r.filtro ? ` • ${r.filtro}` : ""}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#00FFA3]">
                  {formatarValor(r.valor, r.unidade)}
                </p>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}

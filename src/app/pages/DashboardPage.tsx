import { useState } from "react";
import { AlertCircle, LayoutDashboard, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { EmbeddedDashboard } from "../components/EmbeddedDashboard";
import { api } from "../../lib/api/endpoints";
import { useResource } from "../../lib/api/useResource";
import type { DashboardsResponse } from "../../lib/api/types";

/**
 * GET /dashboards devolve as abas ativas com a URL de embed de cada painel.
 * A API não agrega dado nenhum aqui — o front só troca o src do iframe.
 */
export function DashboardPage() {
  const { data, loading, error, refetch } = useResource<DashboardsResponse>(
    (signal) => api.dashboards.listar(signal)
  );
  const [abaAtiva, setAbaAtiva] = useState<number | null>(null);

  const abas = data?.abas ?? [];
  const atual = abas.find((aba) => aba.id_dashboard === abaAtiva) ?? abas[0];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-wider text-white">
          <LayoutDashboard size={32} className="text-[#00FFA3]" />
          Centro de Comando
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Visão integrada de saúde pública nacional
        </p>
      </div>

      {loading && (
        <div className="flex h-[520px] items-center justify-center rounded-xl border border-[rgba(0,255,163,0.15)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(0,255,163,0.2)] border-t-[#00FFA3]" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-[rgba(255,59,92,0.3)] bg-[rgba(255,59,92,0.08)] px-8 py-16 text-center">
          <AlertCircle size={28} className="text-[#FF3B5C]" />
          <p className="text-sm text-white">{error}</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 rounded-lg border border-[rgba(0,255,163,0.2)] bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-sm text-white transition-colors hover:border-[#00FFA3]"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && abas.length === 0 && (
        <div className="rounded-xl border border-dashed border-[rgba(0,255,163,0.3)] px-8 py-16 text-center text-sm text-[rgba(255,255,255,0.5)]">
          Nenhum dashboard ativo configurado.
        </div>
      )}

      {!loading && !error && abas.length > 0 && atual && (
        <>
          {/* Abas */}
          <div
            role="tablist"
            aria-label="Painéis do dashboard"
            className="flex gap-2 border-b border-[rgba(0,255,163,0.15)]"
          >
            {abas.map((aba) => {
              const isActive = aba.id_dashboard === atual.id_dashboard;

              return (
                <button
                  key={aba.id_dashboard}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setAbaAtiva(aba.id_dashboard)}
                  className={`
                    relative px-5 py-3 text-sm font-medium uppercase tracking-wide transition-colors
                    ${isActive
                      ? "text-[#00FFA3]"
                      : "text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.95)]"
                    }
                  `}
                >
                  {aba.nome_aba}
                  {isActive && (
                    <motion.div
                      layoutId="dashboard-tab-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] shadow-[0_0_12px_rgba(0,255,163,0.6)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Painel */}
          <EmbeddedDashboard
            key={atual.id_dashboard}
            title={atual.nome_aba}
            src={atual.url_embbed}
          />
        </>
      )}
    </div>
  );
}

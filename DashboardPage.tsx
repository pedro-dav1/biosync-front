import { LayoutDashboard } from "lucide-react";
import { EmbeddedDashboard } from "../components/EmbeddedDashboard";

/**
 * URL do relatório Power BI publicado na web ("Publicar na Web", sem
 * autoAuth — funciona sem login).
 *
 * Hardcoded por decisão de prazo: a rota GET /dashboards ainda não foi
 * liberada pelo backend a tempo da entrega. O relatório tem 5 páginas
 * (Centro de Comando, Internações & Capacidade, Óbitos & Causas, Rede de
 * Estabelecimentos, Leitos & Ofertas) e a navegação entre elas é feita
 * DENTRO do próprio visualizador do Power BI — por isso não há abas
 * nossas aqui, diferente da versão anterior com o Looker Studio.
 *
 * Quando a API estiver pronta, trocar por useResource(api.dashboards.listar)
 * como estava antes (ver histórico do arquivo).
 */
const URL_POWER_BI =
  "https://app.powerbi.com/view?r=eyJrIjoiNDg3N2RlZjUtMjdlMy00OTc4LWIwMDItMWY1OTZmMGQ5MzJhIiwidCI6IjExZGJiZmUyLTg5YjgtNDU0OS1iZTEwLWNlYzM2NGU1OTU1MSIsImMiOjR9";

export function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold uppercase tracking-wider text-white">
          <LayoutDashboard size={32} className="text-[#00FFA3]" />
          Centro de Comando
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Visão integrada de saúde pública nacional • Navegue entre as páginas
          usando os controles do próprio painel
        </p>
      </div>

      <EmbeddedDashboard title="BioSync — Painel Nacional" src={URL_POWER_BI} height={760} />
    </div>
  );
}

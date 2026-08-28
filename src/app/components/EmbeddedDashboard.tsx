import { useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface EmbeddedDashboardProps {
  /** URL de embed do BI (Looker Studio, Power BI, Metabase, Superset...) */
  src?: string;
  /** Título usado para acessibilidade e no estado vazio */
  title: string;
  /** Altura do iframe em px */
  height?: number;
}

/**
 * Container para embedar um dashboard externo de BI.
 *
 * Enquanto a URL não for informada, mostra um placeholder — assim a tela
 * continua navegável e é só preencher `src` quando o embed estiver pronto.
 */
export function EmbeddedDashboard({ src, title, height = 720 }: EmbeddedDashboardProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[rgba(0,255,163,0.3)] bg-[rgba(255,255,255,0.02)] text-center px-8"
        style={{ height }}
      >
        <AlertTriangle size={28} className="text-[#FFB800]" />
        <p className="text-sm font-medium text-white">Embed não configurado</p>
        <p className="max-w-md text-xs text-[rgba(255,255,255,0.5)]">
          Informe a URL de embed de “{title}” na prop <code className="text-[#00FFA3]">src</code> do
          componente <code className="text-[#00FFA3]">EmbeddedDashboard</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.02)]">
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ height }}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(0,255,163,0.2)] border-t-[#00FFA3]" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        onLoad={() => setLoaded(true)}
        className="w-full"
        style={{ height, border: "none" }}
        allowFullScreen
      />
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-[rgba(0,255,163,0.2)] bg-[rgba(11,31,42,0.85)] px-3 py-1.5 text-xs text-[rgba(255,255,255,0.7)] backdrop-blur-sm transition-colors hover:border-[#00FFA3] hover:text-white"
      >
        <ExternalLink size={12} />
        Abrir
      </a>
    </div>
  );
}

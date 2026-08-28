import { AlertTriangle, AlertCircle, Bell, MapPin, Clock, TrendingUp } from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { ExportButton } from "../components/ExportButton";
import { motion } from "motion/react";

const alerts = [
  {
    id: 1,
    title: "Risco Crítico de Surto de Dengue",
    location: "Região Nordeste - 12 municípios",
    severity: "critical",
    confidence: 94,
    timestamp: "Há 15 minutos",
    description: "Modelo preditivo detectou aumento exponencial de casos. Intervenção urgente necessária.",
    recommendations: [
      "Mobilizar equipes de vigilância epidemiológica",
      "Intensificar campanhas de eliminação de focos",
      "Preparar estoques de medicamentos e testes",
    ]
  },
  {
    id: 2,
    title: "Saturação de Leitos UTI",
    location: "São Paulo - Capital",
    severity: "high",
    confidence: 87,
    timestamp: "Há 1 hora",
    description: "Previsão de 98% de ocupação nas próximas 48h. Risco de colapso do sistema.",
    recommendations: [
      "Ativar protocolo de transferência de pacientes",
      "Expandir leitos temporários",
      "Comunicar secretarias regionais",
    ]
  },
  {
    id: 3,
    title: "Aumento de Síndrome Respiratória",
    location: "Região Norte - 5 estados",
    severity: "medium",
    confidence: 91,
    timestamp: "Há 3 horas",
    description: "Crescimento atípico de 45% em casos respiratórios. Monitoramento contínuo ativo.",
    recommendations: [
      "Reforçar estoque de EPIs",
      "Ampliar testagem em postos de saúde",
      "Alertar rede hospitalar",
    ]
  },
  {
    id: 4,
    title: "Queda na Cobertura Vacinal",
    location: "Nacional",
    severity: "medium",
    confidence: 76,
    timestamp: "Há 6 horas",
    description: "Meta de 90% não será atingida no trimestre. Risco de ressurgimento de doenças.",
    recommendations: [
      "Intensificar campanhas de conscientização",
      "Mobilizar agentes comunitários",
      "Expandir horários de vacinação",
    ]
  },
];

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-[rgba(255,59,92,0.15)]",
        border: "border-[rgba(255,59,92,0.5)]",
        text: "text-[#FF3B5C]",
        glow: "shadow-[0_0_30px_rgba(255,59,92,0.3)]",
      };
    case "high":
      return {
        bg: "bg-[rgba(255,184,0,0.15)]",
        border: "border-[rgba(255,184,0,0.5)]",
        text: "text-[#FFB800]",
        glow: "shadow-[0_0_30px_rgba(255,184,0,0.3)]",
      };
    case "medium":
      return {
        bg: "bg-[rgba(0,212,255,0.15)]",
        border: "border-[rgba(0,212,255,0.5)]",
        text: "text-[#00D4FF]",
        glow: "shadow-[0_0_30px_rgba(0,212,255,0.3)]",
      };
    default:
      return {
        bg: "bg-[rgba(255,255,255,0.05)]",
        border: "border-[rgba(255,255,255,0.2)]",
        text: "text-[rgba(255,255,255,0.7)]",
        glow: "",
      };
  }
}

export function AlertsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-3">
            <Bell size={32} className="text-[#FF3B5C]" />
            Central de Alertas
          </h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Sistema nacional de monitoramento de emergências em saúde pública
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton pageName="Relatório de Alertas" />
          <button className="px-6 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm uppercase font-medium">
            Filtros
          </button>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold uppercase hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all text-sm">
            Novo Alerta
          </button>
        </div>
      </div>

      {/* Critical Banner */}
      <motion.div
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="p-6 rounded-xl bg-gradient-to-r from-[rgba(255,59,92,0.2)] to-[rgba(255,59,92,0.1)] border-2 border-[#FF3B5C] shadow-[0_0_40px_rgba(255,59,92,0.4)]"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle size={32} className="text-[#FF3B5C] flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white uppercase mb-2">
              3 Alertas Críticos Ativos
            </h2>
            <p className="text-[rgba(255,255,255,0.8)] mb-4">
              Requerem ação imediata • Protocolo de emergência ativado
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#FF3B5C] text-white font-medium hover:bg-[#FF2046] transition-colors text-sm">
                Ver Protocolos
              </button>
              <button className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.15)] transition-colors text-sm">
                Notificar Equipes
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, idx) => {
          const colors = getSeverityColor(alert.severity);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlowCard
                className={`${colors.bg} border ${colors.border} ${colors.glow}`}
                hover={true}
              >
                <div className="flex gap-6">
                  {/* Severity Indicator */}
                  <div className="flex flex-col items-center">
                    <AlertCircle size={32} className={colors.text} />
                    <span className={`text-xs font-bold uppercase mt-2 ${colors.text}`}>
                      {alert.severity}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{alert.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-[rgba(255,255,255,0.7)]">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[rgba(255,255,255,0.5)] mb-1">Confiança IA</div>
                        <div className="text-2xl font-bold text-[#00FFA3]">{alert.confidence}%</div>
                      </div>
                    </div>

                    <p className="text-[rgba(255,255,255,0.8)] mb-4">{alert.description}</p>

                    {/* Recommendations */}
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2">
                        <TrendingUp size={14} />
                        Recomendações Emergenciais
                      </h4>
                      <ul className="space-y-2">
                        {alert.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-[rgba(255,255,255,0.7)]"
                          >
                            <span className={`${colors.text} mt-1`}>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all text-sm">
                        Executar Protocolo
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm">
                        Enviar SMS
                      </button>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

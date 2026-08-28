import { FileText, Plus, Download, Brain, AlertTriangle, Activity } from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { StatCard } from "../components/StatCard";
import { motion } from "motion/react";


const reports = [
  {
    id: "rpt001",
    title: "Tendência de Superlotação Hospitalar",
    description: "Análise preditiva de ocupação de leitos nas próximas 4 semanas",
    criticality: "critical",
    aiModel: "ML Preditivo v3.2",
    generatedAt: "Há 2 horas",
    status: "Crítico",
  },
  {
    id: "rpt002",
    title: "Previsão de Falta de Insumos",
    description: "Estimativa de ruptura de estoque em hospitais de alta demanda",
    criticality: "high",
    aiModel: "IA de Supply Chain",
    generatedAt: "Há 5 horas",
    status: "Alto Risco",
  },
  {
    id: "rpt003",
    title: "Crescimento de Doenças Respiratórias",
    description: "Padrão sazonal detectado com aumento de 45% em 12 regiões",
    criticality: "high",
    aiModel: "IA Epidemiológica",
    generatedAt: "Há 1 dia",
    status: "Monitorar",
  },
  {
    id: "rpt004",
    title: "Risco Epidemiológico Regional",
    description: "Mapeamento de focos e clusters de alta transmissibilidade",
    criticality: "medium",
    aiModel: "Geospatial AI",
    generatedAt: "Há 1 dia",
    status: "Médio",
  },
  {
    id: "rpt005",
    title: "Eficiência Operacional Hospitalar",
    description: "Benchmark de performance e gargalos operacionais identificados",
    criticality: "low",
    aiModel: "IA de Analytics",
    generatedAt: "Há 2 dias",
    status: "Normal",
  },
  {
    id: "rpt006",
    title: "Mortalidade e Fatores Críticos",
    description: "Correlação entre comorbidades e outcomes clínicos adversos",
    criticality: "medium",
    aiModel: "IA Clínica",
    generatedAt: "Há 2 dias",
    status: "Médio",
  },
  {
    id: "rpt007",
    title: "Análise de Tempo de Espera",
    description: "Tempo médio de atendimento e gargalos no fluxo de pacientes",
    criticality: "low",
    aiModel: "Process Mining AI",
    generatedAt: "Há 3 dias",
    status: "Normal",
  },
  {
    id: "rpt008",
    title: "Cobertura Vacinal e Vulnerabilidade",
    description: "Gaps de imunização e populações em risco elevado",
    criticality: "high",
    aiModel: "IA Populacional",
    generatedAt: "Há 3 dias",
    status: "Atenção",
  },
];


function getCriticalityColor(level: string) {
  switch (level) {
    case "critical":
      return {
        bg: "bg-[rgba(255,59,92,0.15)]",
        border: "border-[rgba(255,59,92,0.5)]",
        text: "text-[#FF3B5C]",
        badge: "bg-[rgba(255,59,92,0.2)] text-[#FF3B5C] border-[rgba(255,59,92,0.3)]",
      };
    case "high":
      return {
        bg: "bg-[rgba(255,184,0,0.15)]",
        border: "border-[rgba(255,184,0,0.5)]",
        text: "text-[#FFB800]",
        badge: "bg-[rgba(255,184,0,0.2)] text-[#FFB800] border-[rgba(255,184,0,0.3)]",
      };
    case "medium":
      return {
        bg: "bg-[rgba(0,212,255,0.15)]",
        border: "border-[rgba(0,212,255,0.5)]",
        text: "text-[#00D4FF]",
        badge: "bg-[rgba(0,212,255,0.2)] text-[#00D4FF] border-[rgba(0,212,255,0.3)]",
      };
    default:
      return {
        bg: "bg-[rgba(0,255,163,0.15)]",
        border: "border-[rgba(0,255,163,0.5)]",
        text: "text-[#00FFA3]",
        badge: "bg-[rgba(0,255,163,0.2)] text-[#00FFA3] border-[rgba(0,255,163,0.3)]",
      };
  }
}

export function ReportsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-3">
            <FileText size={32} className="text-[#00FFA3]" />
            Central de Relatórios Inteligentes
          </h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Geração automatizada de análises executivas, operacionais e preditivas
          </p>
        </div>
        <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold uppercase hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all flex items-center gap-2">
          <Plus size={20} />
          Novo Relatório
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Relatórios Gerados Hoje"
          value="24"
          change={15.3}
          changeLabel="vs. ontem"
          icon={<FileText size={24} className="text-[#00FFA3]" />}
          trend="up"
        />
        <StatCard
          title="Alertas Críticos Identificados"
          value="8"
          icon={<AlertTriangle size={24} className="text-[#FF3B5C]" />}
          confidence={94}
          glowColor="rgba(255, 59, 92, 0.2)"
        />
        <StatCard
          title="Hospitais Monitorados"
          value="2,847"
          icon={<Activity size={24} className="text-[#6C5CE7]" />}
        />
        <StatCard
          title="Modelos Preditivos Ativos"
          value="12"
          icon={<Brain size={24} className="text-[#00D4FF]" />}
          confidence={96}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-4">
            Relatórios Automatizados
          </h2>

          {reports.map((report, idx) => {
            const colors = getCriticalityColor(report.criticality);

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlowCard className={`${colors.bg} border ${colors.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg">{report.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors.badge}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-[rgba(255,255,255,0.7)] mb-3">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[rgba(255,255,255,0.5)]">
                        <div className="flex items-center gap-1">
                          <Brain size={14} />
                          <span>{report.aiModel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={14} />
                          <span>{report.generatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all flex items-center gap-2 text-sm">
                      <Download size={16} />
                      Exportar
                    </button>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <GlowCard>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm text-left">
                Agendar Relatório Recorrente
              </button>
              <button className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm text-left">
                Configurar Alertas Automáticos
              </button>
              <button className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm text-left">
                Compartilhar Dashboard
              </button>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

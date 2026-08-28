import { Code, Play, Download, Clock, Database, TrendingUp, CheckCircle } from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { useState } from "react";

const sampleQueries = [
  "SELECT COUNT(*) FROM internacoes WHERE data >= '2024-01-01'",
  "SELECT municipio, AVG(taxa_ocupacao) FROM leitos GROUP BY municipio",
  "SELECT * FROM casos_dengue WHERE risco_surto > 0.8",
];

const recentQueries = [
  {
    query: "Análise de ocupação de UTIs por região",
    executedAt: "Há 15 min",
    rows: "2,450",
    status: "success",
  },
  {
    query: "Tendência de casos respiratórios - Norte",
    executedAt: "Há 1 hora",
    rows: "8,230",
    status: "success",
  },
  {
    query: "Ranking de municípios por risco epidemiológico",
    executedAt: "Há 2 horas",
    rows: "5,570",
    status: "success",
  },
];

const datasets = [
  { name: "DATASUS - SIH", records: "2.4M", updated: "Tempo real", status: "online" },
  { name: "DATASUS - SIM", records: "850K", updated: "Há 10 min", status: "online" },
  { name: "SI-PNI (Vacinas)", records: "3.2M", updated: "Há 5 min", status: "online" },
  { name: "E-SUS AB", records: "1.8M", updated: "Há 30 min", status: "online" },
];

export function AnalystPage() {
  const [sqlQuery, setSqlQuery] = useState("");
  const [naturalQuery, setNaturalQuery] = useState("");

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-3">
          <Database size={32} className="text-[#00FFA3]" />
          Workspace de Análise
        </h1>
        <p className="text-[rgba(255,255,255,0.6)]">
          Editor SQL avançado com IA • Exploração de datasets do DATASUS
        </p>
      </div>

      {/* Natural Language to SQL */}
      <GlowCard>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-2">
            Conversor IA: Linguagem Natural → SQL
          </h2>
          <p className="text-sm text-[rgba(255,255,255,0.6)]">
            Descreva o que você precisa e a IA gerará a query otimizada
          </p>
        </div>
        <div className="space-y-4">
          <textarea
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            placeholder="Ex: Mostre todos os municípios com mais de 100 casos de dengue no último mês"
            className="w-full h-24 p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none resize-none"
          />
          <div className="flex gap-3">
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all flex items-center gap-2">
              <TrendingUp size={18} />
              Gerar SQL com IA
            </button>
            <div className="flex-1 flex items-center gap-2 px-4 rounded-lg bg-[rgba(108,92,231,0.1)] border border-[rgba(108,92,231,0.3)]">
              <CheckCircle size={16} className="text-[#6C5CE7]" />
              <span className="text-sm text-[rgba(255,255,255,0.7)]">
                Confiança da query: <span className="font-bold text-[#00FFA3]">92%</span>
              </span>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* SQL Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlowCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Code size={20} />
                Editor SQL
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white hover:border-[#00FFA3] transition-all text-sm">
                  <Download size={16} />
                </button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all flex items-center gap-2 text-sm">
                  <Play size={16} />
                  Executar
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="rounded-lg bg-[#050A0D] border border-[rgba(0,255,163,0.15)] p-4 font-mono text-sm">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="-- Digite sua query SQL aqui&#10;-- A IA oferece autocomplete inteligente"
                className="w-full h-64 bg-transparent text-[#00FFA3] placeholder-[rgba(255,255,255,0.3)] focus:outline-none resize-none"
                style={{ fontFamily: "monospace" }}
              />
            </div>

            {/* Query Suggestions */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2">
                Queries Rápidas
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSqlQuery(query)}
                    className="px-3 py-1 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-xs text-[rgba(255,255,255,0.7)] hover:border-[#00FFA3] hover:text-white transition-all font-mono"
                  >
                    {query.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Datasets */}
          <GlowCard>
            <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">
              Datasets Conectados
            </h2>
            <div className="space-y-3">
              {datasets.map((dataset, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,163,0.1)] hover:border-[rgba(0,255,163,0.3)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{dataset.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                      <span className="text-xs text-[#00FFA3]">{dataset.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[rgba(255,255,255,0.5)]">
                    <span>{dataset.records} registros</span>
                    <span>{dataset.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>

          {/* Recent Queries */}
          <GlowCard>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-[#6C5CE7]" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                Histórico
              </h2>
            </div>
            <div className="space-y-3">
              {recentQueries.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,163,0.1)] hover:border-[rgba(0,255,163,0.3)] transition-colors cursor-pointer"
                >
                  <p className="text-sm text-white mb-1">{item.query}</p>
                  <div className="flex items-center justify-between text-xs text-[rgba(255,255,255,0.5)]">
                    <span>{item.executedAt}</span>
                    <span>{item.rows} linhas</span>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

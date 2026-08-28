import { useState } from "react";
import { Send, Sparkles, Code, TrendingUp } from "lucide-react";
import { GlowCard } from "./GlowCard";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  id: string;
  mes: string;
  casos: number;
  previsao: number;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  hasChart?: boolean;
  hasSql?: boolean;
  sqlQuery?: string;
  confidence?: number;
  chartData?: ChartData[];
}

const exampleData: ChartData[] = [
  { id: "jan", mes: "Jan", casos: 120, previsao: 130 },
  { id: "fev", mes: "Fev", casos: 150, previsao: 165 },
  { id: "mar", mes: "Mar", casos: 180, previsao: 195 },
  { id: "abr", mes: "Abr", casos: 220, previsao: 240 },
  { id: "mai", mes: "Mai", casos: 280, previsao: 310 },
  { id: "jun", mes: "Jun", casos: 350, previsao: 380 },
];

export function AIChat() {
  const [query, setQuery] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      type: "ai",
      content:
        "Olá! Sou o assistente de IA do BIOSYN. Posso ajudar com análises epidemiológicas, previsões hospitalares e consultas aos dados do DATASUS.",
    },
  ]);

  const [showSql, setShowSql] = useState<string | null>(null);

  const handleSend = () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentQuery = query;

    setTimeout(() => {
      let responseContent = "";
      let sqlQuery = "";

      if (
        currentQuery.toLowerCase().includes("hospital") ||
        currentQuery.toLowerCase().includes("uti")
      ) {
        responseContent =
          "Identifiquei 12 hospitais com risco crítico de saturação nas próximas 72h. Principais fatores: aumento de 45% em casos respiratórios e ocupação atual de 89% dos leitos de UTI.";

        sqlQuery = `SELECT
  h.nome_hospital,
  h.ocupacao_uti,
  h.previsao_saturacao,
  h.risco_colapso
FROM hospitais h
INNER JOIN internacoes i ON h.id = i.hospital_id
WHERE h.ocupacao_uti > 0.85
  AND i.data_entrada >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY h.risco_colapso DESC
LIMIT 12;`;
      } else if (
        currentQuery.toLowerCase().includes("vacin") ||
        currentQuery.toLowerCase().includes("cobertura")
      ) {
        responseContent =
          "A análise indica que 85 municípios apresentam cobertura vacinal abaixo de 70%. O risco de surto aumenta em 34% nas próximas 8 semanas.";

        sqlQuery = `SELECT
  municipio,
  cobertura_vacinal,
  risco_surto
FROM vacinacao
WHERE cobertura_vacinal < 0.70
ORDER BY risco_surto DESC;`;
      } else {
        responseContent =
          "Com base nos dados do DATASUS, identifiquei padrões relevantes na sua consulta. A previsão indica tendência de crescimento de 18% nos próximos 14 dias.";

        sqlQuery = `SELECT
  data_registro,
  COUNT(*) as total_casos
FROM casos_registrados
WHERE data_registro >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY data_registro
ORDER BY data_registro DESC;`;
      }

      const aiResponse: Message = {
        id: crypto.randomUUID(),
        type: "ai",
        content: responseContent,
        hasChart: true,
        hasSql: true,
        confidence: 94,
        chartData: exampleData,
        sqlQuery,
      };

      setMessages((prev) => [...prev, aiResponse]);
    }, 1200);

    setQuery("");
  };

  return (
    <GlowCard className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              className={`flex ${
                msg.type === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] ${
                  msg.type === "user"
                    ? "bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] p-4 rounded-xl"
                    : "space-y-4"
                }`}
              >
                {msg.type === "user" ? (
                  <p className="font-medium">{msg.content}</p>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center flex-shrink-0">
                        <Sparkles
                          size={16}
                          className="text-[#0B1F2A]"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-[rgba(255,255,255,0.9)] leading-relaxed">
                          {msg.content}
                        </p>

                        {msg.confidence && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <span className="text-[rgba(255,255,255,0.5)]">
                              Confiança:
                            </span>

                            <span className="font-bold text-[#00FFA3]">
                              {msg.confidence}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {msg.hasChart && msg.chartData && (
                      <div className="ml-11 p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(0,255,163,0.15)]">
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <TrendingUp
                            size={16}
                            className="text-[#00FFA3]"
                          />
                          Projeção de Casos
                        </h4>

                        <ResponsiveContainer
                          width="100%"
                          height={220}
                        >
                          <LineChart data={msg.chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />

                            <XAxis
                              dataKey="mes"
                              stroke="rgba(255,255,255,0.5)"
                            />

                            <YAxis
                              stroke="rgba(255,255,255,0.5)"
                            />

                            <Tooltip
                              contentStyle={{
                                backgroundColor:
                                  "rgba(11, 31, 42, 0.95)",
                                border:
                                  "1px solid rgba(0,255,163,0.3)",
                                borderRadius: "8px",
                              }}
                            />

                            <Line
                              type="monotone"
                              dataKey="casos"
                              stroke="#00FFA3"
                              strokeWidth={2}
                            />

                            <Line
                              type="monotone"
                              dataKey="previsao"
                              stroke="#6C5CE7"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {msg.hasSql && (
                      <div className="ml-11">
                        <button
                          onClick={() =>
                            setShowSql(
                              showSql === msg.id
                                ? null
                                : msg.id
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-sm text-[#00FFA3] hover:border-[#00FFA3] transition-all"
                        >
                          <Code size={16} />

                          {showSql === msg.id
                            ? "Ocultar Query"
                            : "Mostrar Query SQL"}
                        </button>

                        <AnimatePresence initial={false}>
                          {showSql === msg.id && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                height: 0,
                              }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                              }}
                              exit={{
                                opacity: 0,
                                height: 0,
                              }}
                              transition={{
                                duration: 0.25,
                              }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 p-4 rounded-lg bg-[#050A0D] border border-[rgba(0,255,163,0.3)]">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />

                                  <span className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
                                    Query Gerada por IA
                                  </span>
                                </div>

                                <pre className="text-sm text-[#00FFA3] font-mono overflow-x-auto whitespace-pre-wrap">
                                  {msg.sqlQuery}
                                </pre>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Pergunte ao BIOSYN..."
          className="flex-1 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none"
        />

        <button
          onClick={handleSend}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all"
        >
          <Send size={20} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          {
            id: "s1",
            text: "Quais hospitais possuem maior risco de colapso?",
          },
          {
            id: "s2",
            text: "Preveja aumento de dengue no Nordeste",
          },
          {
            id: "s3",
            text: "Quais municípios precisam de reforço vacinal?",
          },
        ].map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => setQuery(suggestion.text)}
            className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-xs text-[rgba(255,255,255,0.7)] hover:border-[#00FFA3] hover:text-white transition-all"
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </GlowCard>
  );
}
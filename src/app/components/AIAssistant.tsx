import { useState } from "react";
import { Brain, Send, Sparkles, X } from "lucide-react";
import { GlowCard } from "./GlowCard";
import { motion, AnimatePresence } from "motion/react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ type: "user" | "ai"; content: string }>>([]);

  const handleSend = () => {
    if (!query.trim()) return;

    setMessages([...messages, { type: "user", content: query }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Analisando dados do DATASUS... Identificados 12 municípios com risco elevado de surto de dengue nos próximos 14 dias. Score de confiança: 94%."
        }
      ]);
    }, 1000);

    setQuery("");
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] shadow-[0_0_40px_rgba(0,255,163,0.5)] flex items-center justify-center hover:shadow-[0_0_60px_rgba(0,255,163,0.7)] transition-all duration-300 z-50"
          >
            <Brain size={28} className="text-[#0B1F2A]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 w-[420px] h-[600px] z-50"
          >
            <GlowCard className="h-full flex flex-col p-0 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-[rgba(0,255,163,0.15)] bg-gradient-to-r from-[rgba(0,255,163,0.1)] to-[rgba(108,92,231,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center">
                    <Brain size={18} className="text-[#0B1F2A]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wide text-sm">Assistente IA</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                      <span className="text-xs text-[rgba(255,255,255,0.7)]">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-[#00FFA3] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-[rgba(255,255,255,0.7)]">
                      Olá! Sou o assistente de IA da BIOSYN. Posso ajudar você a:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-[rgba(255,255,255,0.6)]">
                      <li>• Consultar dados do DATASUS</li>
                      <li>• Gerar análises preditivas</li>
                      <li>• Criar relatórios automatizados</li>
                      <li>• Identificar riscos epidemiológicos</li>
                    </ul>
                  </div>
                </div>

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.type === "user"
                          ? "bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium"
                          : "bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.9)]"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[rgba(0,255,163,0.15)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Pergunte ao BIOSYN..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors text-sm"
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium hover:shadow-[0_0_20px_rgba(0,255,163,0.5)] transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

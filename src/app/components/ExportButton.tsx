import { Download, FileText, Sheet, File } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface ExportButtonProps {
  pageName?: string;
}

export function ExportButton({ pageName = "Relatório" }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setIsOpen(false);

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(`${pageName} exportado com sucesso!`, {
      description: `Arquivo ${format.toUpperCase()} gerado`,
      duration: 3000,
    });

    setIsExporting(false);
  };

  const exportOptions = [
    { format: "PDF", icon: FileText, color: "#FF3B5C" },
    { format: "CSV", icon: Sheet, color: "#00FFA3" },
    { format: "XLSX", icon: File, color: "#6C5CE7" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-medium hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all disabled:opacity-50"
      >
        <Download size={18} />
        <span>{isExporting ? "Exportando..." : "Exportar"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-[rgba(11,31,42,0.95)] backdrop-blur-xl border border-[rgba(0,255,163,0.3)] shadow-[0_0_30px_rgba(0,255,163,0.2)] overflow-hidden z-50"
          >
            {exportOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,255,163,0.1)] transition-colors text-left border-b border-[rgba(0,255,163,0.1)] last:border-b-0"
                >
                  <Icon size={18} style={{ color: option.color }} />
                  <div>
                    <p className="text-sm font-medium text-white">Exportar {option.format}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">
                      {option.format === "PDF" && "Documento formatado"}
                      {option.format === "CSV" && "Dados tabulares"}
                      {option.format === "XLSX" && "Planilha Excel"}
                    </p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

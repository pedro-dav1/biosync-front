import { User } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../lib/auth/AuthContext";

/**
 * Barra superior.
 *
 * A busca global e o sino de notificações foram removidos: nenhum dos dois
 * tinha rota de API por trás, e deixar campos clicáveis sem função real
 * confunde mais do que ajuda numa apresentação.
 */
export function TopBar() {
  const { usuario } = useAuth();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-gradient-to-r from-[rgba(11,31,42,0.8)] to-[rgba(11,31,42,0.6)] backdrop-blur-md border-b border-[rgba(0,255,163,0.15)] px-8 flex items-center justify-end sticky top-0 z-40"
    >
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-[#0B1F2A]" />
        </div>
        <div className="text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {usuario?.nome_completo ?? "—"}
          </p>
          <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
            {usuario?.cargo ?? "—"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

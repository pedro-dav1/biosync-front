import { motion } from "motion/react";
import { Logo } from "./Logo";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-[#0B1F2A] via-[#081419] to-[#0B1F2A] flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="lg" className="mb-8 justify-center" />
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-64 h-1 bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent rounded-full mx-auto"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-[rgba(255,255,255,0.5)] uppercase tracking-wider"
        >
          Inicializando Sistema de Inteligência
        </motion.p>
      </div>
    </motion.div>
  );
}

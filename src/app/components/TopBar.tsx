import { Bell, Search, User } from "lucide-react";
import { motion } from "motion/react";

export function TopBar() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-gradient-to-r from-[rgba(11,31,42,0.8)] to-[rgba(11,31,42,0.6)] backdrop-blur-md border-b border-[rgba(0,255,163,0.15)] px-8 flex items-center justify-between sticky top-0 z-40"
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]" />
          <input
            type="text"
            placeholder="Buscar hospitais, municípios, alertas..."
            className="w-full pl-12 pr-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-[rgba(255,255,255,0.7)] hover:border-[#00FFA3] hover:text-white transition-all">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B5C] rounded-full animate-pulse" />
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] hover:border-[#00FFA3] transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center">
            <User size={16} className="text-[#0B1F2A]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Admin Gestor</p>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">MS</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

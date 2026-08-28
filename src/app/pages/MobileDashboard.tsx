import { AlertTriangle, Activity, TrendingUp, Bell, Menu, X } from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { Logo } from "../components/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const alerts = [
  { title: "Surto de Dengue", severity: "critical", location: "Nordeste" },
  { title: "Saturação UTI", severity: "high", location: "São Paulo" },
  { title: "Síndrome Respiratória", severity: "medium", location: "Norte" },
];

const metrics = [
  { label: "Internações", value: "7.2k", change: "+12.5%", trend: "up" },
  { label: "Ocupação", value: "87%", change: "+5.8%", trend: "up" },
  { label: "Cobertura Vacinal", value: "73.4%", change: "-2.1%", trend: "down" },
];

export function MobileDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1F2A] pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[rgba(11,31,42,0.95)] to-[rgba(11,31,42,0.9)] backdrop-blur-md border-b border-[rgba(0,255,163,0.15)] px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)]">
            {menuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
          <Logo size="sm" />
          <button className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] relative">
            <Bell size={20} className="text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B5C] rounded-full animate-pulse" />
          </button>
        </div>
      </div>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#0B1F2A] border-r border-[rgba(0,255,163,0.15)] z-50 p-4"
            >
              <div className="mb-6">
                <Logo size="md" />
              </div>
              <nav className="space-y-2">
                {["Dashboard", "Alertas", "Insights IA", "Epidemiologia"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-3 rounded-lg text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all"
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Critical Alert Banner */}
        <motion.div
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-4 rounded-xl bg-gradient-to-r from-[rgba(255,59,92,0.2)] to-[rgba(255,59,92,0.1)] border-2 border-[#FF3B5C]"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-[#FF3B5C] flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">3 Alertas Críticos</p>
              <p className="text-xs text-[rgba(255,255,255,0.7)]">Ação imediata necessária</p>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards - Swipeable */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[calc(100vw-4rem)] snap-center"
            >
              <GlowCard className="h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
                    {metric.label}
                  </p>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgba(0,255,163,0.2)] to-[rgba(108,92,231,0.2)] flex items-center justify-center">
                    <Activity size={20} className="text-[#00FFA3]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
                <div className={`flex items-center gap-1 ${metric.trend === 'up' ? 'text-[#00FFA3]' : 'text-[#FF3B5C]'}`}>
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>

        {/* Alerts List */}
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-3">
            Alertas Ativos
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, idx) => {
              const severityColors = {
                critical: "border-[#FF3B5C] bg-[rgba(255,59,92,0.1)]",
                high: "border-[#FFB800] bg-[rgba(255,184,0,0.1)]",
                medium: "border-[#00D4FF] bg-[rgba(0,212,255,0.1)]",
              };

              return (
                <GlowCard
                  key={idx}
                  className={`${severityColors[alert.severity as keyof typeof severityColors]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{alert.title}</h3>
                      <p className="text-xs text-[rgba(255,255,255,0.6)]">{alert.location}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold uppercase"
                      style={{
                        color: alert.severity === 'critical' ? '#FF3B5C' : alert.severity === 'high' ? '#FFB800' : '#00D4FF'
                      }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <button className="w-full mt-3 py-2 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] text-sm font-bold">
                    Ver Protocolo
                  </button>
                </GlowCard>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Quick Access */}
        <GlowCard className="bg-gradient-to-r from-[rgba(0,255,163,0.1)] to-[rgba(108,92,231,0.1)]">
          <div className="text-center py-4">
            <p className="text-sm text-[rgba(255,255,255,0.7)] mb-3">
              Precisa de insights rápidos?
            </p>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold">
              Perguntar ao Assistente IA
            </button>
          </div>
        </GlowCard>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B1F2A] to-[rgba(11,31,42,0.9)] backdrop-blur-md border-t border-[rgba(0,255,163,0.15)] px-4 py-3 z-40">
        <div className="flex items-center justify-around">
          {[
            { icon: Activity, label: "Dashboard" },
            { icon: AlertTriangle, label: "Alertas" },
            { icon: TrendingUp, label: "Insights" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className="flex flex-col items-center gap-1 text-[rgba(255,255,255,0.5)] hover:text-[#00FFA3] transition-colors"
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

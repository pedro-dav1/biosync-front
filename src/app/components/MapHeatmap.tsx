import { MapPin } from "lucide-react";
import { motion } from "motion/react";

const regions = [
  { name: "Norte", x: 45, y: 20, risk: 76, color: "#FFB800" },
  { name: "Nordeste", x: 70, y: 30, risk: 88, color: "#FF3B5C" },
  { name: "Centro-Oeste", x: 40, y: 50, risk: 65, color: "#00D4FF" },
  { name: "Sudeste", x: 60, y: 65, risk: 94, color: "#FF3B5C" },
  { name: "Sul", x: 50, y: 85, risk: 72, color: "#FFB800" },
];

export function MapHeatmap() {
  return (
    <div className="relative h-64 rounded-lg bg-gradient-to-br from-[rgba(0,255,163,0.05)] to-[rgba(255,59,92,0.1)] border border-[rgba(0,255,163,0.15)] overflow-hidden">
      {/* Background Brazil Silhouette */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M 100 40 L 140 60 L 150 100 L 140 140 L 100 160 L 60 140 L 50 100 L 60 60 Z"
            fill="rgba(0, 255, 163, 0.3)"
            stroke="rgba(0, 255, 163, 0.5)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Region Markers */}
      {regions.map((region, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="absolute"
          style={{ left: `${region.x}%`, top: `${region.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {/* Pulse Ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-12 h-12 rounded-full border-2"
            style={{ borderColor: region.color }}
          />

          {/* Center Dot */}
          <div
            className="relative w-4 h-4 rounded-full shadow-lg cursor-pointer group"
            style={{ backgroundColor: region.color }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-3 py-2 rounded-lg bg-[rgba(11,31,42,0.95)] border border-[rgba(0,255,163,0.3)] whitespace-nowrap">
                <p className="text-xs font-bold text-white">{region.name}</p>
                <p className="text-xs text-[rgba(255,255,255,0.7)]">
                  Risco: <span style={{ color: region.color }}>{region.risk}%</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(11,31,42,0.8)] backdrop-blur-sm border border-[rgba(0,255,163,0.2)]">
          <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
          <span className="text-[rgba(255,255,255,0.7)]">Baixo</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(11,31,42,0.8)] backdrop-blur-sm border border-[rgba(0,255,163,0.2)]">
          <div className="w-2 h-2 rounded-full bg-[#FFB800]" />
          <span className="text-[rgba(255,255,255,0.7)]">Médio</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(11,31,42,0.8)] backdrop-blur-sm border border-[rgba(0,255,163,0.2)]">
          <div className="w-2 h-2 rounded-full bg-[#FF3B5C]" />
          <span className="text-[rgba(255,255,255,0.7)]">Alto</span>
        </div>
      </div>
    </div>
  );
}

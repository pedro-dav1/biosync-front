import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { GlowCard } from "./GlowCard";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  confidence?: number;
  glowColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  confidence,
  glowColor
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-[#00FFA3]";
    if (trend === "down") return "text-[#FF3B5C]";
    return "text-[rgba(255,255,255,0.7)]";
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  return (
    <GlowCard className="relative overflow-hidden" glowColor={glowColor}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,163,0.05)] to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
          </div>
          {icon && (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgba(0,255,163,0.2)] to-[rgba(108,92,231,0.2)] flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              <TrendIcon size={16} />
              <span className="text-sm font-medium">{change > 0 ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-xs text-[rgba(255,255,255,0.5)]">{changeLabel}</span>}
            </div>
          )}

          {confidence !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[rgba(255,255,255,0.5)]">Confiança IA:</span>
              <span className="text-xs font-bold text-[#00FFA3]">{confidence}%</span>
            </div>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

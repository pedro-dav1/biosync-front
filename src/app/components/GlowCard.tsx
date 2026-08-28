import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
}

export function GlowCard({ children, className = "", glowColor = "rgba(0, 255, 163, 0.1)", hover = true }: GlowCardProps) {
  return (
    <div
      className={`
        relative rounded-xl p-6 backdrop-blur-md
        bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.02)]
        border border-[rgba(0,255,163,0.15)]
        ${hover ? 'transition-all duration-300 hover:border-[rgba(0,255,163,0.4)] hover:shadow-[0_0_30px_rgba(0,255,163,0.2)]' : ''}
        ${className}
      `}
      style={{
        boxShadow: `0 0 20px ${glowColor}`
      }}
    >
      {children}
    </div>
  );
}

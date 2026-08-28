import { GlowCard } from "../components/GlowCard";
import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderPage({ icon: Icon, title, description }: PlaceholderPageProps) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[600px]">
      <GlowCard className="max-w-2xl w-full text-center">
        <div className="py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] mx-auto mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,163,0.5)]">
            <Icon size={40} className="text-[#0B1F2A]" />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-4">{title}</h1>
          <p className="text-lg text-[rgba(255,255,255,0.7)] mb-8">{description}</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[rgba(0,255,163,0.1)] border border-[rgba(0,255,163,0.3)]">
            <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-sm text-[#00FFA3] font-medium">Em Desenvolvimento</span>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

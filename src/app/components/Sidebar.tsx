import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Bot,
  LogOut
} from "lucide-react";
import { Logo } from "./Logo";

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "dashboard" },
  { icon: AlertTriangle, label: "Alertas", route: "alerts" },
  { icon: FileText, label: "Relatórios", route: "reports" },
  { icon: Bot, label: "Assistente", route: "chat" },
  { icon: Users, label: "Usuários", route: "users" },
];

export function Sidebar({ activeRoute, onNavigate, onLogout }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#0B1F2A] to-[#081419] border-r border-[rgba(0,255,163,0.15)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(0,255,163,0.15)]">
        <Logo size="md" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.route;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 text-left
                ${isActive
                  ? 'bg-gradient-to-r from-[rgba(0,255,163,0.2)] to-[rgba(108,92,231,0.2)] text-[#00FFA3] border border-[rgba(0,255,163,0.3)] shadow-[0_0_20px_rgba(0,255,163,0.2)]'
                  : 'text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[rgba(255,255,255,0.95)]'
                }
              `}
            >
              <Icon size={20} />
              <span className="text-sm font-medium uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[rgba(0,255,163,0.15)]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center">
            <span className="text-xs font-bold text-[#0B1F2A]">AG</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Admin Gestor</p>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">Ministério da Saúde</p>
          </div>
          <button
            onClick={onLogout}
            title="Sair"
            aria-label="Sair"
            className="text-[rgba(255,255,255,0.5)] hover:text-[#FF3B5C] transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

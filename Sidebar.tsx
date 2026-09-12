import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Bot,
  LogOut
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../../lib/auth/AuthContext";

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", route: "dashboard", apenasAdmin: false },
  { icon: AlertTriangle, label: "Alertas", route: "alerts", apenasAdmin: true },
  { icon: FileText, label: "Relatórios", route: "reports", apenasAdmin: false },
  { icon: Bot, label: "Assistente", route: "chat", apenasAdmin: false },
  { icon: Users, label: "Usuários", route: "users", apenasAdmin: true },
];

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({ activeRoute, onNavigate, onLogout }: SidebarProps) {
  const { usuario, isAdmin } = useAuth();

  // Alertas e Usuários exigem admin na API (403 pra usuário comum) — o item
  // nem aparece no menu pra quem não tem acesso, em vez de aparecer clicável
  // e cair silenciosamente no Dashboard.
  const itensVisiveis = menuItems.filter((item) => isAdmin || !item.apenasAdmin);

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-[#0B1F2A] to-[#081419] border-r border-[rgba(0,255,163,0.15)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(0,255,163,0.15)]">
        <Logo size="md" />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {itensVisiveis.map((item) => {
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
            <span className="text-xs font-bold text-[#0B1F2A]">
              {usuario ? iniciais(usuario.nome_completo) : "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {usuario?.nome_completo ?? "—"}
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
              {usuario?.organizacao ?? "—"}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Sair"
            aria-label="Sair"
            className="text-[rgba(255,255,255,0.5)] hover:text-[#FF3B5C] transition-colors flex-shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

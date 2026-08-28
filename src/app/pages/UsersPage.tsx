import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  Shield,
  MoreVertical,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: "active" | "inactive";
  mfa: boolean;
  lastAccess: string;
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Dr. João Silva",
    email: "joao.silva@saude.gov.br",
    role: "Gestor Estadual",
    organization: "Secretaria de Saúde - SP",
    status: "active",
    mfa: true,
    lastAccess: "Há 5 minutos",
  },
  {
    id: 2,
    name: "Dra. Maria Santos",
    email: "maria.santos@saude.gov.br",
    role: "Analista Epidemiológico",
    organization: "Ministério da Saúde",
    status: "active",
    mfa: true,
    lastAccess: "Há 1 hora",
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos.oliveira@saude.gov.br",
    role: "Técnico Hospitalar",
    organization: "Hospital das Clínicas - RJ",
    status: "active",
    mfa: false,
    lastAccess: "Há 3 horas",
  },
  {
    id: 4,
    name: "Ana Paula Costa",
    email: "ana.costa@saude.gov.br",
    role: "Administrador",
    organization: "DATASUS",
    status: "active",
    mfa: true,
    lastAccess: "Há 20 minutos",
  },
  {
    id: 5,
    name: "Roberto Ferreira",
    email: "roberto.ferreira@saude.gov.br",
    role: "Gestor Estadual",
    organization: "Secretaria de Saúde - BA",
    status: "inactive",
    mfa: false,
    lastAccess: "Há 15 dias",
  },
];

const roles = [
  "Administrador",
  "Gestor Estadual",
  "Analista Epidemiológico",
  "Técnico Hospitalar",
];

function getRoleBadgeColor(role: string) {
  switch (role) {
    case "Administrador":
      return "bg-[rgba(255,59,92,0.2)] text-[#FF3B5C] border-[rgba(255,59,92,0.3)]";
    case "Gestor Estadual":
      return "bg-[rgba(108,92,231,0.2)] text-[#6C5CE7] border-[rgba(108,92,231,0.3)]";
    case "Analista Epidemiológico":
      return "bg-[rgba(0,255,163,0.2)] text-[#00FFA3] border-[rgba(0,255,163,0.3)]";
    default:
      return "bg-[rgba(0,212,255,0.2)] text-[#00D4FF] border-[rgba(0,212,255,0.3)]";
  }
}

/* ------------------------------------------------------------------ */
/* Busca por proximidade de nome                                       */
/* ------------------------------------------------------------------ */

/** Remove acentos e caixa, pra "joao" casar com "João". */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Distância de Levenshtein: quantas edições separam duas palavras. */
function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,      // inserção
        previous[j] + 1,         // remoção
        previous[j - 1] + cost   // substituição
      );
    }
    previous = current;
  }

  return previous[b.length];
}

/**
 * Score de 0 a 1 do quanto o usuário casa com a busca.
 * 0 = descartado. Quanto maior, mais no topo da lista.
 */
function matchScore(user: User, rawQuery: string) {
  const query = normalize(rawQuery);
  if (!query) return 1;

  const name = normalize(user.name);

  // Casamento exato do começo do nome — melhor resultado possível.
  if (name.startsWith(query)) return 1;
  // Trecho aparece em qualquer lugar do nome.
  if (name.includes(query)) return 0.9;

  // Proximidade palavra por palavra (tolera erro de digitação).
  const words = name.split(/\s+/);
  let best = 0;
  for (const word of words) {
    if (word.startsWith(query)) {
      best = Math.max(best, 0.85);
      continue;
    }
    const distance = levenshtein(word, query);
    // Tolerância cresce com o tamanho da palavra: até ~30% de erro.
    const tolerance = Math.max(1, Math.floor(word.length * 0.3));
    if (distance <= tolerance) {
      best = Math.max(best, 0.8 - distance / (word.length + 1));
    }
  }
  if (best > 0) return best;

  // Fallback: email e organização, com peso menor.
  if (normalize(user.email).includes(query)) return 0.5;
  if (normalize(user.organization).includes(query)) return 0.4;

  return 0;
}

/* ------------------------------------------------------------------ */

const emptyForm = {
  name: "",
  email: "",
  role: roles[1],
  organization: "",
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fecha o menu de 3 pontinhos ao clicar fora ou apertar Esc.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
        setIsFormOpen(false);
        setConfirmDelete(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .map((user) => ({ user, score: matchScore(user, searchQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.user);
  }, [users, searchQuery]);

  const stats = useMemo(
    () => [
      { label: "Total de Usuários", value: users.length, color: "#00FFA3" },
      {
        label: "Ativos",
        value: users.filter((u) => u.status === "active").length,
        color: "#6C5CE7",
      },
      {
        label: "Com MFA",
        value: users.filter((u) => u.mfa).length,
        color: "#00D4FF",
      },
      {
        label: "Inativos",
        value: users.filter((u) => u.status === "inactive").length,
        color: "#FFB800",
      },
    ],
    [users]
  );

  const openCreateForm = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setOpenMenuId(null);
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u))
      );
      toast.success("Usuário atualizado");
    } else {
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [
        ...prev,
        {
          id: nextId,
          ...form,
          status: "active",
          mfa: false,
          lastAccess: "Nunca acessou",
        },
      ]);
      toast.success("Usuário adicionado");
    }

    setIsFormOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
    toast.success(`${confirmDelete.name} removido`);
    setConfirmDelete(null);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Controle de acesso e permissões • {users.length} usuários cadastrados
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold uppercase hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all text-sm flex items-center gap-2"
        >
          <UserPlus size={18} />
          Adicionar Usuário
        </button>
      </div>

      {/* Busca */}
      <GlowCard>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuário por nome..."
            className="w-full pl-12 pr-12 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Limpar busca"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-3 text-xs text-[rgba(255,255,255,0.5)]">
            {filteredUsers.length} resultado(s) por proximidade de nome
          </p>
        )}
      </GlowCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.02)] border border-[rgba(0,255,163,0.15)]"
          >
            <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <GlowCard className="overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,255,163,0.15)]">
                {["Usuário", "Cargo", "Organização", "Status", "Último Acesso"].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left py-4 px-6 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] font-medium"
                    >
                      {header}
                    </th>
                  )
                )}
                <th className="text-center py-4 px-6 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[rgba(255,255,255,0.5)]"
                  >
                    Nenhum usuário encontrado para “{searchQuery}”.
                  </td>
                </tr>
              )}

              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[rgba(0,255,163,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center">
                        <span className="text-sm font-bold text-[#0B1F2A]">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[rgba(255,255,255,0.5)]">
                            {user.email}
                          </p>
                          {user.mfa && (
                            <span title="MFA Ativado" className="inline-flex">
                            <Shield size={12} className="text-[#00FFA3]" />
                          </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-[rgba(255,255,255,0.7)]">
                      {user.organization}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {user.status === "active" ? (
                        <>
                          <CheckCircle size={16} className="text-[#00FFA3]" />
                          <span className="text-sm text-[#00FFA3]">Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-[rgba(255,255,255,0.3)]" />
                          <span className="text-sm text-[rgba(255,255,255,0.3)]">
                            Inativo
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-[rgba(255,255,255,0.7)]">
                      {user.lastAccess}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === user.id ? null : user.id)
                        }
                        aria-label={`Ações para ${user.name}`}
                        className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors p-1"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === user.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[rgba(0,255,163,0.25)] bg-[rgba(11,31,42,0.98)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
                        >
                          <button
                            onClick={() => openEditForm(user)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(0,255,163,0.1)]"
                          >
                            <Pencil size={15} className="text-[#00FFA3]" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setConfirmDelete(user);
                            }}
                            className="flex w-full items-center gap-3 border-t border-[rgba(255,255,255,0.08)] px-4 py-3 text-left text-sm text-[#FF3B5C] transition-colors hover:bg-[rgba(255,59,92,0.1)]"
                          >
                            <Trash2 size={15} />
                            Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* Modal adicionar / editar */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,10,14,0.75)] p-4 backdrop-blur-sm"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-[rgba(0,255,163,0.25)] bg-gradient-to-br from-[rgba(11,31,42,0.98)] to-[rgba(8,20,25,0.98)] p-8 shadow-[0_0_60px_rgba(0,255,163,0.2)]"
          >
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">
                {editingUser ? "Editar Usuário" : "Adicionar Usuário"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                aria-label="Fechar"
                className="text-[rgba(255,255,255,0.5)] transition-colors hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. João Silva"
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nome@saude.gov.br"
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Cargo
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white transition-colors focus:border-[#00FFA3] focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-[#0B1F2A]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">
                  Organização
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="Secretaria de Saúde - SP"
                  className="w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex-1 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] py-3 text-sm font-medium text-white transition-all hover:border-[#00FFA3]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] py-3 text-sm font-bold uppercase tracking-wider text-[#0B1F2A] transition-all hover:shadow-[0_0_30px_rgba(0,255,163,0.5)]"
              >
                {editingUser ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,10,14,0.75)] p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-[rgba(255,59,92,0.3)] bg-gradient-to-br from-[rgba(11,31,42,0.98)] to-[rgba(8,20,25,0.98)] p-8 shadow-[0_0_60px_rgba(255,59,92,0.2)]"
          >
            <div className="mb-4 flex items-center gap-3">
              <Trash2 size={22} className="text-[#FF3B5C]" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                Deletar usuário
              </h2>
            </div>
            <p className="mb-8 text-sm text-[rgba(255,255,255,0.7)]">
              Tem certeza que deseja remover{" "}
              <span className="font-bold text-white">{confirmDelete.name}</span>? Essa ação
              não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] py-3 text-sm font-medium text-white transition-all hover:border-[#00FFA3]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-[#FF3B5C] py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(255,59,92,0.5)]"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  Shield,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { GlowCard } from "../components/GlowCard";
import { toast } from "sonner";
import { api } from "../../lib/api/endpoints";
import { ApiError } from "../../lib/api/client";
import { mensagemDeErro, useResource } from "../../lib/api/useResource";
import type {
  CargoRef,
  Endereco,
  OrganizacoesResponse,
  UsuarioCreateRequest,
  UsuarioListaItem,
  UsuariosListaResponse,
} from "../../lib/api/types";

function getRoleBadgeColor(cargo: string) {
  const c = cargo.toLowerCase();
  if (c.includes("admin")) return "bg-[rgba(255,59,92,0.2)] text-[#FF3B5C] border-[rgba(255,59,92,0.3)]";
  if (c.includes("gestor")) return "bg-[rgba(108,92,231,0.2)] text-[#6C5CE7] border-[rgba(108,92,231,0.3)]";
  if (c.includes("epidemi")) return "bg-[rgba(0,255,163,0.2)] text-[#00FFA3] border-[rgba(0,255,163,0.3)]";
  return "bg-[rgba(0,212,255,0.2)] text-[#00D4FF] border-[rgba(0,212,255,0.3)]";
}

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TAMANHO_PAGINA = 20;

type FormState = {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  is_admin: boolean;
  cargo_id: number | "";
  organizacao_id: number | "";
  endereco: Endereco;
};

const enderecoVazio: Endereco = {
  tipo_logradouro: "Rua",
  logradouro: "",
  numero: 0,
  cep: "",
  estado_uf: "",
  cidade: "",
  complemento: "",
};

const formVazio: FormState = {
  nome: "",
  sobrenome: "",
  cpf: "",
  email: "",
  telefone: "",
  senha: "",
  is_admin: false,
  cargo_id: "",
  organizacao_id: "",
  endereco: enderecoVazio,
};

/** Erros de campo vindos do backend, indexados pelo nome do campo. */
type ErrosCampo = Record<string, string>;

function extrairErrosCampo(erro: unknown): ErrosCampo {
  if (!(erro instanceof ApiError) || !erro.campos.length) return {};
  const mapa: ErrosCampo = {};
  for (const c of erro.campos) mapa[c.campo] = c.detalhe;
  return mapa;
}

export function UsersPage() {
  // --- busca com debounce: a filtragem é do backend (LIKE no nome) ---
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [busca, setBusca] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setBusca(buscaDigitada.trim()), 350);
    return () => clearTimeout(t);
  }, [buscaDigitada]);

  const [pagina, setPagina] = useState(1);
  useEffect(() => setPagina(1), [busca]);

  const {
    data: listaUsuarios,
    loading: carregandoUsuarios,
    error: erroUsuarios,
    refetch: recarregarUsuarios,
  } = useResource<UsuariosListaResponse>(
    (signal) => api.usuarios.listar({ busca, pagina, tamanho: TAMANHO_PAGINA }, signal),
    [busca, pagina]
  );

  const { data: cargosResp } = useResource((signal) => api.apoio.cargos(signal), []);
  const { data: orgsResp } = useResource<OrganizacoesResponse>(
    (signal) => api.apoio.organizacoes(signal),
    []
  );
  const cargos: CargoRef[] = cargosResp?.itens ?? [];
  const organizacoes = orgsResp?.itens ?? [];

  const usuarios = listaUsuarios?.itens ?? [];
  const total = listaUsuarios?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));

  // --- menu de ações (3 pontinhos) ---
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fecharFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    const escFecha = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenuId(null);
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", escFecha);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", escFecha);
    };
  }, []);

  // --- modal criar/editar ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioListaItem | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [errosCampo, setErrosCampo] = useState<ErrosCampo>({});
  const [salvando, setSalvando] = useState(false);

  const abrirCriar = () => {
    setEditando(null);
    setForm(formVazio);
    setErrosCampo({});
    setIsFormOpen(true);
  };

  const abrirEditar = (u: UsuarioListaItem) => {
    setOpenMenuId(null);
    setEditando(u);
    const [nome, ...resto] = u.nome_completo.split(" ");
    setForm({
      nome,
      sobrenome: resto.join(" "),
      cpf: "",
      email: u.email,
      telefone: u.telefone,
      senha: "",
      is_admin: u.is_admin,
      cargo_id: u.cargo.id_cargo,
      organizacao_id: u.organizacao.id_organizacao,
      endereco: enderecoVazio,
    });
    setErrosCampo({});
    setIsFormOpen(true);
  };

  const validarLocal = (): ErrosCampo => {
    const e: ErrosCampo = {};
    if (!form.nome.trim()) e.nome = "Obrigatório.";
    if (!form.sobrenome.trim()) e.sobrenome = "Obrigatório.";
    if (!editando && !/^\d{11}$/.test(form.cpf)) e.cpf = "Deve ter 11 dígitos.";
    if (!form.email.includes("@")) e.email = "E-mail inválido.";
    if (!/^\d{10,11}$/.test(form.telefone)) e.telefone = "Só dígitos, com DDD.";
    if (!editando && form.senha.length < 8) e.senha = "Mínimo de 8 caracteres.";
    if (editando && form.senha && form.senha.length < 8) e.senha = "Mínimo de 8 caracteres.";
    if (!form.cargo_id) e.cargo_id = "Selecione um cargo.";
    if (!form.organizacao_id) e.organizacao_id = "Selecione uma organização.";
    if (!editando) {
      if (!form.endereco.logradouro.trim()) e.logradouro = "Obrigatório.";
      if (!form.endereco.numero) e.numero = "Obrigatório.";
      if (!/^[A-Za-z]{2}$/.test(form.endereco.estado_uf)) e.estado_uf = "UF com 2 letras.";
      if (!form.endereco.cidade.trim()) e.cidade = "Obrigatório.";
    }
    return e;
  };

  const handleSalvar = async () => {
    const errosLocais = validarLocal();
    if (Object.keys(errosLocais).length) {
      setErrosCampo(errosLocais);
      return;
    }

    setSalvando(true);
    setErrosCampo({});
    try {
      if (editando) {
        await api.usuarios.editar(editando.id_usuario, {
          email: form.email,
          telefone: form.telefone,
          nome: form.nome,
          sobrenome: form.sobrenome,
          is_admin: form.is_admin,
          cargo_id: Number(form.cargo_id),
          organizacao_id: Number(form.organizacao_id),
          endereco: form.endereco,
          ...(form.senha ? { senha: form.senha } : {}),
        });
        toast.success("Usuário atualizado.");
      } else {
        const payload: UsuarioCreateRequest = {
          cpf: form.cpf,
          email: form.email,
          telefone: form.telefone,
          senha: form.senha,
          nome: form.nome,
          sobrenome: form.sobrenome,
          is_admin: form.is_admin,
          cargo_id: Number(form.cargo_id),
          organizacao_id: Number(form.organizacao_id),
          endereco: form.endereco,
        };
        await api.usuarios.criar(payload);
        toast.success("Usuário adicionado.");
      }
      setIsFormOpen(false);
      recarregarUsuarios();
    } catch (erro) {
      const campos = extrairErrosCampo(erro);
      if (Object.keys(campos).length) {
        setErrosCampo(campos);
      } else {
        toast.error(mensagemDeErro(erro));
      }
    } finally {
      setSalvando(false);
    }
  };

  // --- exclusão ---
  const [confirmDelete, setConfirmDelete] = useState<UsuarioListaItem | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setExcluindo(true);
    try {
      await api.usuarios.desativar(confirmDelete.id_usuario);
      toast.success(`${confirmDelete.nome_completo} desativado.`);
      setConfirmDelete(null);
      recarregarUsuarios();
    } catch (erro) {
      // AUTO_DESATIVACAO e outros erros de negócio chegam aqui como toast.
      toast.error(mensagemDeErro(erro));
    } finally {
      setExcluindo(false);
    }
  };

  const stats = useMemo(
    () => [
      { label: "Total (nesta página)", value: usuarios.length, color: "#00FFA3" },
      { label: "Administradores", value: usuarios.filter((u) => u.is_admin).length, color: "#6C5CE7" },
      { label: "Total no sistema", value: total, color: "#00D4FF" },
    ],
    [usuarios, total]
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Controle de acesso e permissões • {total} usuário(s) cadastrado(s)
          </p>
        </div>
        <button
          onClick={abrirCriar}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] text-[#0B1F2A] font-bold uppercase hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] transition-all text-sm flex items-center gap-2"
        >
          <UserPlus size={18} />
          Adicionar Usuário
        </button>
      </div>

      <GlowCard>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)]" />
          <input
            type="text"
            value={buscaDigitada}
            onChange={(e) => setBuscaDigitada(e.target.value)}
            placeholder="Buscar usuário por nome..."
            className="w-full pl-12 pr-12 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(0,255,163,0.15)] text-white placeholder-[rgba(255,255,255,0.3)] focus:border-[#00FFA3] focus:outline-none transition-colors"
          />
          {buscaDigitada && (
            <button
              onClick={() => setBuscaDigitada("")}
              aria-label="Limpar busca"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </GlowCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-lg bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.02)] border border-[rgba(0,255,163,0.15)]"
          >
            <p className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <GlowCard className="overflow-visible">
        {carregandoUsuarios && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgba(0,255,163,0.2)] border-t-[#00FFA3]" />
          </div>
        )}

        {!carregandoUsuarios && erroUsuarios && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={26} className="text-[#FF3B5C]" />
            <p className="text-sm text-white">{erroUsuarios}</p>
            <button
              onClick={recarregarUsuarios}
              className="px-4 py-2 rounded-lg border border-[rgba(0,255,163,0.2)] text-sm text-white hover:border-[#00FFA3] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregandoUsuarios && !erroUsuarios && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(0,255,163,0.15)]">
                    {["Usuário", "Cargo", "Organização", "Telefone"].map((h) => (
                      <th key={h} className="text-left py-4 px-6 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] font-medium">
                        {h}
                      </th>
                    ))}
                    <th className="text-center py-4 px-6 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)] font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-[rgba(255,255,255,0.5)]">
                        Nenhum usuário encontrado{busca ? ` para "${busca}"` : ""}.
                      </td>
                    </tr>
                  )}

                  {usuarios.map((u) => (
                    <tr key={u.id_usuario} className="border-b border-[rgba(0,255,163,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FFA3] to-[#6C5CE7] flex items-center justify-center">
                            <span className="text-sm font-bold text-[#0B1F2A]">{iniciais(u.nome_completo)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{u.nome_completo}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-[rgba(255,255,255,0.5)]">{u.email}</p>
                              {u.is_admin && <Shield size={12} className="text-[#00FFA3]" aria-label="Administrador" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.cargo.nome_cargo)}`}>
                          {u.cargo.nome_cargo}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-[rgba(255,255,255,0.7)]">{u.organizacao.nome}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-[rgba(255,255,255,0.7)]">{u.telefone}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === u.id_usuario ? null : u.id_usuario)}
                            aria-label={`Ações para ${u.nome_completo}`}
                            className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors p-1"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === u.id_usuario && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-[rgba(0,255,163,0.25)] bg-[rgba(11,31,42,0.98)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
                            >
                              <button
                                onClick={() => abrirEditar(u)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(0,255,163,0.1)]"
                              >
                                <Pencil size={15} className="text-[#00FFA3]" />
                                Editar
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); setConfirmDelete(u); }}
                                className="flex w-full items-center gap-3 border-t border-[rgba(255,255,255,0.08)] px-4 py-3 text-left text-sm text-[#FF3B5C] transition-colors hover:bg-[rgba(255,59,92,0.1)]"
                              >
                                <Trash2 size={15} />
                                Desativar
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

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-[rgba(0,255,163,0.1)] px-6 py-4">
                <p className="text-xs text-[rgba(255,255,255,0.5)]">
                  Página {pagina} de {totalPaginas}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina <= 1}
                    className="p-2 rounded-lg border border-[rgba(0,255,163,0.15)] text-white disabled:opacity-30 hover:border-[#00FFA3] transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas}
                    className="p-2 rounded-lg border border-[rgba(0,255,163,0.15)] text-white disabled:opacity-30 hover:border-[#00FFA3] transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </GlowCard>

      {/* Modal criar/editar */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,10,14,0.75)] p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => !salvando && setIsFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl rounded-2xl border border-[rgba(0,255,163,0.25)] bg-gradient-to-br from-[rgba(11,31,42,0.98)] to-[rgba(8,20,25,0.98)] p-8 shadow-[0_0_60px_rgba(0,255,163,0.2)]"
          >
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">
                {editando ? "Editar Usuário" : "Adicionar Usuário"}
              </h2>
              <button onClick={() => setIsFormOpen(false)} aria-label="Fechar" className="text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Campo label="Nome" erro={errosCampo.nome}>
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={inputCls} />
              </Campo>
              <Campo label="Sobrenome" erro={errosCampo.sobrenome}>
                <input value={form.sobrenome} onChange={(e) => setForm({ ...form, sobrenome: e.target.value })} className={inputCls} />
              </Campo>

              {!editando && (
                <Campo label="CPF (11 dígitos)" erro={errosCampo.cpf}>
                  <input
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, "") })}
                    maxLength={11}
                    className={inputCls}
                  />
                </Campo>
              )}
              <Campo label="E-mail" erro={errosCampo.email}>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </Campo>

              <Campo label="Telefone (com DDD)" erro={errosCampo.telefone}>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value.replace(/\D/g, "") })}
                  maxLength={11}
                  className={inputCls}
                />
              </Campo>
              <Campo label={editando ? "Nova senha (opcional)" : "Senha"} erro={errosCampo.senha}>
                <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className={inputCls} />
              </Campo>

              <Campo label="Cargo" erro={errosCampo.cargo_id}>
                <select
                  value={form.cargo_id}
                  onChange={(e) => setForm({ ...form, cargo_id: Number(e.target.value) })}
                  className={inputCls}
                >
                  <option value="">Selecione...</option>
                  {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo} className="bg-[#0B1F2A]">
                      {c.nome_cargo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Organização" erro={errosCampo.organizacao_id}>
                <select
                  value={form.organizacao_id}
                  onChange={(e) => setForm({ ...form, organizacao_id: Number(e.target.value) })}
                  className={inputCls}
                >
                  <option value="">Selecione...</option>
                  {organizacoes.map((o) => (
                    <option key={o.id_organizacao} value={o.id_organizacao} className="bg-[#0B1F2A]">
                      {o.nome_organizacao}
                    </option>
                  ))}
                </select>
              </Campo>

              <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                <input
                  id="is_admin"
                  type="checkbox"
                  checked={form.is_admin}
                  onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
                  className="h-4 w-4 accent-[#00FFA3]"
                />
                <label htmlFor="is_admin" className="text-sm text-[rgba(255,255,255,0.75)]">
                  Conceder privilégio de administrador
                </label>
              </div>

              {!editando && (
                <>
                  <div className="sm:col-span-2 mt-2 border-t border-[rgba(255,255,255,0.08)] pt-5">
                    <p className="mb-4 text-xs uppercase tracking-wider text-[rgba(255,255,255,0.5)]">Endereço</p>
                  </div>

                  <Campo label="Tipo de logradouro">
                    <select
                      value={form.endereco.tipo_logradouro}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, tipo_logradouro: e.target.value } })}
                      className={inputCls}
                    >
                      {["Rua", "Avenida", "Alameda", "Travessa", "Rodovia"].map((t) => (
                        <option key={t} value={t} className="bg-[#0B1F2A]">{t}</option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Logradouro" erro={errosCampo.logradouro}>
                    <input
                      value={form.endereco.logradouro}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, logradouro: e.target.value } })}
                      className={inputCls}
                    />
                  </Campo>

                  <Campo label="Número" erro={errosCampo.numero}>
                    <input
                      type="number"
                      value={form.endereco.numero || ""}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, numero: Number(e.target.value) } })}
                      className={inputCls}
                    />
                  </Campo>
                  <Campo label="CEP (opcional)">
                    <input
                      value={form.endereco.cep ?? ""}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, cep: e.target.value } })}
                      className={inputCls}
                    />
                  </Campo>

                  <Campo label="Cidade" erro={errosCampo.cidade}>
                    <input
                      value={form.endereco.cidade}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, cidade: e.target.value } })}
                      className={inputCls}
                    />
                  </Campo>
                  <Campo label="UF" erro={errosCampo.estado_uf}>
                    <input
                      value={form.endereco.estado_uf}
                      onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, estado_uf: e.target.value.toUpperCase() } })}
                      maxLength={2}
                      className={inputCls}
                    />
                  </Campo>

                  <div className="sm:col-span-2">
                    <Campo label="Complemento (opcional)">
                      <input
                        value={form.endereco.complemento ?? ""}
                        onChange={(e) => setForm({ ...form, endereco: { ...form.endereco, complemento: e.target.value } })}
                        className={inputCls}
                      />
                    </Campo>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsFormOpen(false)}
                disabled={salvando}
                className="flex-1 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] py-3 text-sm font-medium text-white transition-all hover:border-[#00FFA3] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#00FFA3] to-[#6C5CE7] py-3 text-sm font-bold uppercase tracking-wider text-[#0B1F2A] transition-all hover:shadow-[0_0_30px_rgba(0,255,163,0.5)] disabled:opacity-60"
              >
                {salvando ? "Salvando..." : editando ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de desativação */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,10,14,0.75)] p-4 backdrop-blur-sm"
          onClick={() => !excluindo && setConfirmDelete(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[rgba(255,59,92,0.3)] bg-gradient-to-br from-[rgba(11,31,42,0.98)] to-[rgba(8,20,25,0.98)] p-8 shadow-[0_0_60px_rgba(255,59,92,0.2)]">
            <div className="mb-4 flex items-center gap-3">
              <Trash2 size={22} className="text-[#FF3B5C]" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-white">Desativar usuário</h2>
            </div>
            <p className="mb-8 text-sm text-[rgba(255,255,255,0.7)]">
              Tem certeza que deseja desativar <span className="font-bold text-white">{confirmDelete.nome_completo}</span>? O acesso dele será revogado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={excluindo}
                className="flex-1 rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] py-3 text-sm font-medium text-white transition-all hover:border-[#00FFA3] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={excluindo}
                className="flex-1 rounded-lg bg-[#FF3B5C] py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:shadow-[0_0_30px_rgba(255,59,92,0.5)] disabled:opacity-60"
              >
                {excluindo ? "Desativando..." : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[rgba(0,255,163,0.15)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] transition-colors focus:border-[#00FFA3] focus:outline-none";

function Campo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-wider text-[rgba(255,255,255,0.7)]">{label}</label>
      {children}
      {erro && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[#FF3B5C]">
          <AlertCircle size={12} />
          {erro}
        </p>
      )}
    </div>
  );
}


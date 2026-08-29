import { createServer } from "node:http";

/**
 * Backend FALSO do BioSync.
 *
 * Implementa o contrato da documentação v1 com dados fictícios, incluindo os
 * códigos de erro. Serve para desenvolver o front antes do FastAPI existir.
 *
 * Rodar:  node mock/server.mjs
 * Porta:  8000
 *
 * Usuários para teste (senha: 12345678):
 *   admin@saude.gov.br      -> is_admin = true
 *   analista@saude.gov.br   -> is_admin = false  (testa o 403)
 */

const PORTA = 8000;
const PREFIXO = "/api/v1";

/* ---------------------------------------------------------------- */
/* Dados em memória                                                  */
/* ---------------------------------------------------------------- */

const SENHA_PADRAO = "12345678";

const cargos = [
  { id_cargo: 1, nome_cargo: "Administrador" },
  { id_cargo: 2, nome_cargo: "Gestor Estadual" },
  { id_cargo: 3, nome_cargo: "Analista Epidemiológico" },
  { id_cargo: 4, nome_cargo: "Técnico Hospitalar" },
];

const organizacoes = [
  { id_organizacao: 1, nome_organizacao: "Ministério da Saúde" },
  { id_organizacao: 2, nome_organizacao: "Secretaria de Saúde - SP" },
  { id_organizacao: 3, nome_organizacao: "Secretaria de Saúde - BA" },
  { id_organizacao: 4, nome_organizacao: "DATASUS" },
  { id_organizacao: 5, nome_organizacao: "Hospital das Clínicas - RJ" },
];

let proximoId = 7;

let usuarios = [
  { id_usuario: 1, cpf: "11111111111", nome: "Admin", sobrenome: "Gestor", email: "admin@saude.gov.br", telefone: "11999990001", is_admin: true, cargo_id: 1, organizacao_id: 1, ativo: 1 },
  { id_usuario: 2, cpf: "22222222222", nome: "Ana", sobrenome: "Epidemióloga", email: "analista@saude.gov.br", telefone: "11999990002", is_admin: false, cargo_id: 3, organizacao_id: 1, ativo: 1 },
  { id_usuario: 3, cpf: "33333333333", nome: "João", sobrenome: "Silva", email: "joao.silva@saude.gov.br", telefone: "11999990003", is_admin: false, cargo_id: 2, organizacao_id: 2, ativo: 1 },
  { id_usuario: 4, cpf: "44444444444", nome: "Maria", sobrenome: "Santos", email: "maria.santos@saude.gov.br", telefone: "71999990004", is_admin: false, cargo_id: 3, organizacao_id: 3, ativo: 1 },
  { id_usuario: 5, cpf: "55555555555", nome: "Carlos", sobrenome: "Oliveira", email: "carlos.oliveira@saude.gov.br", telefone: "21999990005", is_admin: false, cargo_id: 4, organizacao_id: 5, ativo: 1 },
  { id_usuario: 6, cpf: "66666666666", nome: "Roberto", sobrenome: "Ferreira", email: "roberto.ferreira@saude.gov.br", telefone: "71999990006", is_admin: false, cargo_id: 2, organizacao_id: 3, ativo: 1 },
];

const dashboards = [
  { id_dashboard: 1, nome_aba: "Visão Geral", url_embbed: "https://datastudio.google.com/embed/reporting/cdc6ffc3-bf66-4968-aaaa-5c67983e3213/page/nxvrE" },
  { id_dashboard: 2, nome_aba: "População", url_embbed: "https://datastudio.google.com/embed/reporting/67de9620-dc76-4ea1-affe-861233c73582/page/6HUrF" },
  { id_dashboard: 3, nome_aba: "Hospitais", url_embbed: "https://datastudio.google.com/embed/reporting/6e4cf3ea-e7c5-46f4-b945-24695bbb215f/page/DkGLF" },
];

const metricas = [
  { id_metrica: 1, nome: "Internações SUS", descricao: "Total de internações registradas no período" },
  { id_metrica: 2, nome: "Taxa de ocupação de UTI", descricao: "Percentual médio de ocupação de leitos de UTI" },
  { id_metrica: 3, nome: "Leitos disponíveis", descricao: "Média de leitos livres no período" },
  { id_metrica: 4, nome: "Cobertura de atenção primária", descricao: "Percentual da população coberta pela APS" },
  { id_metrica: 5, nome: "Óbitos hospitalares", descricao: "Total de óbitos registrados em internações" },
];

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

// token -> id_usuario
const sessoes = new Map();

let proximoIdAlerta = 1;

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

function nomeCompleto(u) {
  return `${u.nome} ${u.sobrenome}`;
}

function usuarioSessao(u) {
  return {
    id_usuario: u.id_usuario,
    nome_completo: nomeCompleto(u),
    email: u.email,
    is_admin: u.is_admin,
    cargo: cargos.find((c) => c.id_cargo === u.cargo_id)?.nome_cargo ?? "",
    organizacao: organizacoes.find((o) => o.id_organizacao === u.organizacao_id)?.nome_organizacao ?? "",
  };
}

function json(res, status, corpo) {
  const texto = JSON.stringify(corpo);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(texto),
  });
  res.end(texto);
}

function erro(res, status, codigo, mensagem, campos) {
  json(res, status, { erro: campos ? { codigo, mensagem, campos } : { codigo, mensagem } });
}

function autenticar(req) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const id = sessoes.get(token);
  return usuarios.find((u) => u.id_usuario === id && u.ativo === 1) ?? null;
}

function lerCorpo(req) {
  return new Promise((resolve) => {
    let dados = "";
    req.on("data", (pedaco) => (dados += pedaco));
    req.on("end", () => {
      try {
        resolve(dados ? JSON.parse(dados) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

/** Atraso artificial: sem isso os estados de loading nunca aparecem na tela. */
function atraso() {
  return new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
}

/** Número pseudoaleatório estável para a mesma combinação de entradas. */
function valorMetrica(idMetrica, filtro) {
  const semente = [...`${idMetrica}${filtro ?? "BR"}`].reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (semente * 9301 + 49297) % 233280 / 233280;
  switch (idMetrica) {
    case 1: return { valor: Math.round(50000 + r * 300000), unidade: "numero" };
    case 2: return { valor: Math.round((60 + r * 35) * 10) / 10, unidade: "percentual" };
    case 3: return { valor: Math.round(800 + r * 9000), unidade: "numero" };
    case 4: return { valor: Math.round((55 + r * 40) * 10) / 10, unidade: "percentual" };
    default: return { valor: Math.round(500 + r * 12000), unidade: "numero" };
  }
}

/* ---------------------------------------------------------------- */
/* Rotas                                                             */
/* ---------------------------------------------------------------- */

async function rotear(req, res, rota, url) {
  const metodo = req.method;

  /* --- 3. Autenticação --- */

  if (rota === "/auth/login" && metodo === "POST") {
    const corpo = await lerCorpo(req);
    const u = usuarios.find((x) => x.email === corpo?.email && x.ativo === 1);
    if (!u || corpo?.senha !== SENHA_PADRAO) {
      return erro(res, 401, "CREDENCIAIS_INVALIDAS", "E-mail ou senha inválidos.");
    }
    const token = `mock-${u.id_usuario}-${Date.now()}`;
    sessoes.set(token, u.id_usuario);
    return json(res, 200, {
      access_token: token,
      token_type: "bearer",
      expira_em: 28800,
      usuario: usuarioSessao(u),
    });
  }

  // Daqui em diante tudo exige token.
  const atual = autenticar(req);
  if (!atual) return erro(res, 401, "NAO_AUTENTICADO", "Token ausente ou inválido.");

  if (rota === "/auth/me" && metodo === "GET") {
    return json(res, 200, usuarioSessao(atual));
  }

  /* --- 4. Dashboard --- */

  if (rota === "/dashboards" && metodo === "GET") {
    return json(res, 200, { abas: dashboards });
  }

  /* --- 5. Alertas (admin) --- */

  if (rota === "/alertas" && metodo === "POST") {
    if (!atual.is_admin) return erro(res, 403, "ACESSO_NEGADO", "Requer privilégio de administrador.");
    const corpo = await lerCorpo(req);
    const mensagem = corpo?.mensagem ?? "";
    const uf = corpo?.estado_uf ?? "";
    const campos = [];
    if (!mensagem || mensagem.length > 500) campos.push({ campo: "mensagem", detalhe: "Deve ter entre 1 e 500 caracteres." });
    if (!UFS.includes(uf)) campos.push({ campo: "estado_uf", detalhe: "UF inválida." });
    if (campos.length) return erro(res, 422, "VALIDACAO", "Dados inválidos.", campos);

    // UF "XX" não existe; use AC para simular falha do gateway de SMS.
    if (uf === "AC") return erro(res, 502, "FALHA_GATEWAY_SMS", "O provedor de SMS não respondeu.");

    return json(res, 201, {
      id_alerta: proximoIdAlerta++,
      estado_uf_destino: uf,
      destinatarios: 400 + Math.floor(Math.random() * 60000),
      criado_em: new Date().toISOString(),
    });
  }

  /* --- 6. Relatórios --- */

  if (rota === "/relatorios/metricas" && metodo === "GET") {
    return json(res, 200, { metricas });
  }

  if (rota === "/relatorios" && metodo === "POST") {
    const corpo = await lerCorpo(req);
    const lista = corpo?.metricas ?? [];
    const periodo = corpo?.periodo ?? {};
    const formato = corpo?.formato ?? "json";

    if (!Array.isArray(lista) || lista.length === 0) {
      return erro(res, 422, "VALIDACAO", "Selecione ao menos uma métrica.", [
        { campo: "metricas", detalhe: "Lista vazia." },
      ]);
    }
    for (const m of lista) {
      if (!metricas.some((x) => x.id_metrica === m.id_metrica)) {
        return erro(res, 422, "METRICA_DESCONHECIDA", `Métrica ${m.id_metrica} não existe.`);
      }
    }
    if (!periodo.inicio || !periodo.fim || periodo.inicio > periodo.fim) {
      return erro(res, 422, "PERIODO_INVALIDO", "Data inicial deve ser anterior à final.");
    }

    const resultados = lista.map((m) => {
      const meta = metricas.find((x) => x.id_metrica === m.id_metrica);
      const { valor, unidade } = valorMetrica(m.id_metrica, m.filtro);
      return { id_metrica: m.id_metrica, nome: meta.nome, filtro: m.filtro ?? null, valor, unidade };
    });

    if (formato === "csv" || formato === "xlsx") {
      const linhas = ["id_metrica,nome,filtro,valor,unidade"];
      for (const r of resultados) {
        linhas.push(`${r.id_metrica},"${r.nome}",${r.filtro ?? ""},${r.valor},${r.unidade}`);
      }
      const texto = linhas.join("\n");
      res.writeHead(200, {
        "Content-Type": formato === "csv" ? "text/csv; charset=utf-8" : "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="relatorio_biosync.${formato === "csv" ? "csv" : "xls"}"`,
      });
      return res.end(texto);
    }

    return json(res, 200, {
      gerado_em: new Date().toISOString(),
      periodo: { inicio: periodo.inicio, fim: periodo.fim },
      resultados,
    });
  }

  /* --- 7. Usuários (admin) --- */

  if (rota.startsWith("/usuarios")) {
    if (!atual.is_admin) return erro(res, 403, "ACESSO_NEGADO", "Requer privilégio de administrador.");

    const partes = rota.split("/").filter(Boolean);
    const id = partes.length > 1 ? Number(partes[1]) : null;

    if (rota === "/usuarios" && metodo === "GET") {
      const busca = (url.searchParams.get("busca") ?? "").toLowerCase();
      const pagina = Math.max(1, Number(url.searchParams.get("pagina") ?? 1));
      const tamanho = Math.min(100, Math.max(1, Number(url.searchParams.get("tamanho") ?? 20)));

      const filtrados = usuarios
        .filter((u) => u.ativo === 1)
        .filter((u) => !busca || nomeCompleto(u).toLowerCase().includes(busca));

      const inicio = (pagina - 1) * tamanho;
      const itens = filtrados.slice(inicio, inicio + tamanho).map((u) => ({
        id_usuario: u.id_usuario,
        nome_completo: nomeCompleto(u),
        email: u.email,
        telefone: u.telefone,
        is_admin: u.is_admin,
        cargo: cargos.find((c) => c.id_cargo === u.cargo_id),
        organizacao: {
          id_organizacao: u.organizacao_id,
          nome: organizacoes.find((o) => o.id_organizacao === u.organizacao_id)?.nome_organizacao,
        },
      }));

      return json(res, 200, { total: filtrados.length, pagina, tamanho, itens });
    }

    if (rota === "/usuarios" && metodo === "POST") {
      const corpo = await lerCorpo(req);
      const campos = [];
      if (!/^\d{11}$/.test(corpo?.cpf ?? "")) campos.push({ campo: "cpf", detalhe: "Deve ter 11 dígitos." });
      if (!corpo?.email?.includes("@")) campos.push({ campo: "email", detalhe: "E-mail inválido." });
      if ((corpo?.senha ?? "").length < 8) campos.push({ campo: "senha", detalhe: "Mínimo de 8 caracteres." });
      if (!corpo?.nome) campos.push({ campo: "nome", detalhe: "Obrigatório." });
      if (!corpo?.sobrenome) campos.push({ campo: "sobrenome", detalhe: "Obrigatório." });
      if (campos.length) return erro(res, 422, "VALIDACAO", "Dados inválidos.", campos);

      if (usuarios.some((u) => u.cpf === corpo.cpf)) return erro(res, 409, "CPF_DUPLICADO", "CPF já cadastrado.");
      if (usuarios.some((u) => u.email === corpo.email)) return erro(res, 409, "EMAIL_DUPLICADO", "E-mail já cadastrado.");
      if (usuarios.some((u) => u.telefone === corpo.telefone)) return erro(res, 409, "TELEFONE_DUPLICADO", "Telefone já cadastrado.");
      if (!cargos.some((c) => c.id_cargo === corpo.cargo_id) || !organizacoes.some((o) => o.id_organizacao === corpo.organizacao_id)) {
        return erro(res, 422, "REFERENCIA_INVALIDA", "Cargo ou organização inexistente.");
      }

      const novo = { ...corpo, id_usuario: proximoId++, ativo: 1 };
      usuarios.push(novo);
      return json(res, 201, {
        id_usuario: novo.id_usuario,
        nome_completo: nomeCompleto(novo),
        email: novo.email,
        criado_em: new Date().toISOString(),
      });
    }

    if (id && metodo === "PUT") {
      const alvo = usuarios.find((u) => u.id_usuario === id && u.ativo === 1);
      if (!alvo) return erro(res, 404, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado.");
      const corpo = await lerCorpo(req);
      if (corpo?.email && usuarios.some((u) => u.email === corpo.email && u.id_usuario !== id)) {
        return erro(res, 409, "EMAIL_DUPLICADO", "E-mail já cadastrado.");
      }
      Object.assign(alvo, { ...corpo, cpf: alvo.cpf, id_usuario: alvo.id_usuario });
      return json(res, 200, {
        id_usuario: alvo.id_usuario,
        nome_completo: nomeCompleto(alvo),
        email: alvo.email,
        atualizado_em: new Date().toISOString(),
      });
    }

    if (id && metodo === "DELETE") {
      if (id === atual.id_usuario) return erro(res, 409, "AUTO_DESATIVACAO", "Você não pode desativar a si mesmo.");
      const alvo = usuarios.find((u) => u.id_usuario === id && u.ativo === 1);
      if (!alvo) return erro(res, 404, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado.");
      alvo.ativo = 0;
      res.writeHead(204);
      return res.end();
    }
  }

  /* --- 8. Dados de apoio (admin) --- */

  if (rota === "/cargos" && metodo === "GET") {
    if (!atual.is_admin) return erro(res, 403, "ACESSO_NEGADO", "Requer privilégio de administrador.");
    return json(res, 200, { itens: cargos });
  }

  if (rota === "/organizacoes" && metodo === "GET") {
    if (!atual.is_admin) return erro(res, 403, "ACESSO_NEGADO", "Requer privilégio de administrador.");
    return json(res, 200, { itens: organizacoes });
  }

  /* --- 9. Chat --- */

  if (rota === "/chat" && metodo === "POST") {
    const corpo = await lerCorpo(req);
    const pergunta = (corpo?.pergunta ?? "").trim();
    if (!pergunta) return erro(res, 422, "PERGUNTA_VAZIA", "A pergunta não pode estar vazia.");
    if (/delete|drop|update |insert/i.test(pergunta)) {
      return erro(res, 403, "CONSULTA_NAO_PERMITIDA", "Apenas consultas de leitura são permitidas.");
    }
    return json(res, 200, {
      resposta: `Resposta simulada para: "${pergunta}". Nos dados fictícios, São Paulo lidera em internações (312.480) e o Amazonas tem a maior ocupação de UTI proporcional.`,
      sql_executado: "SELECT uf, SUM(internacoes) AS total FROM fato_internacoes GROUP BY uf ORDER BY total DESC LIMIT 5",
      linhas_retornadas: 5,
      tempo_ms: 400 + Math.floor(Math.random() * 900),
    });
  }

  return erro(res, 404, "ROTA_NAO_ENCONTRADA", `Sem rota para ${metodo} ${rota}.`);
}

/* ---------------------------------------------------------------- */

createServer(async (req, res) => {
  // CORS liberado: útil se o front chamar direto, sem o proxy do Vite.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORTA}`);
  if (!url.pathname.startsWith(PREFIXO)) {
    return erro(res, 404, "ROTA_NAO_ENCONTRADA", "Use o prefixo /api/v1.");
  }
  const rota = url.pathname.slice(PREFIXO.length) || "/";

  await atraso();

  try {
    await rotear(req, res, rota, url);
  } catch (e) {
    console.error(e);
    erro(res, 500, "ERRO_INTERNO", "Falha inesperada no mock.");
  }
}).listen(PORTA, () => {
  console.log(`\n  Mock BioSync no ar em http://localhost:${PORTA}${PREFIXO}`);
  console.log(`  Login: admin@saude.gov.br  |  senha: ${SENHA_PADRAO}`);
  console.log(`  Sem admin: analista@saude.gov.br\n`);
});

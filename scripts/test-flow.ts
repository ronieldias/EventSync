// scripts/test-flow.ts
//import fetch from "node-fetch"; 

const API_URL = "http://localhost:3000";

// Cores para o terminal
const CLR = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  red: "\x1b[31m",
};

// Variáveis Globais
let tokenOrg = "";
let tokenUserA = "";
let tokenUserB = "";
let eventId = "";
let regIdA = "";
let regIdB = "";
let friendshipId = "";

// --- CORREÇÃO AQUI: Adicionado ': Promise<any>' ---
async function req(method: string, endpoint: string, token: string | null = null, body: any = null): Promise<any> {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log(`${CLR.yellow}➡️  ${method} ${endpoint}${CLR.reset}`);
  
  const options: any = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json(); // TypeScript agora sabe que isso retorna 'any'

  if (!response.ok) {
    console.error(`${CLR.red}❌ Erro (${response.status}):${CLR.reset}`, JSON.stringify(data, null, 2));
    throw new Error(`Falha em ${endpoint}`);
  }

  console.log(`${CLR.green}✅ Sucesso:${CLR.reset}`, JSON.stringify(data, null, 2).substring(0, 100) + "...");
  return data;
}

async function runTests() {
  console.log(`${CLR.blue}🚀 INICIANDO TESTE COMPLETO DO EVENTSYNC${CLR.reset}\n`);

  try {
    // --- 1. AUTENTICAÇÃO ---
    console.log(`\n${CLR.blue}--- [1] AUTENTICAÇÃO ---${CLR.reset}`);
    
    // Criar Organizador
    await req("POST", "/auth/register", null, {
      nome: "Organizador Chefe", email: "org@test.com", senha: "123", cidade: "Lisboa", role: "organizer"
    });
    const loginOrg = await req("POST", "/auth/login", null, { email: "org@test.com", senha: "123" });
    tokenOrg = loginOrg.token; // Agora o TS não reclama

    // Criar Alice
    await req("POST", "/auth/register", null, {
      nome: "Alice Participante", email: "alice@test.com", senha: "123", cidade: "Porto", role: "user"
    });
    const loginA = await req("POST", "/auth/login", null, { email: "alice@test.com", senha: "123" });
    tokenUserA = loginA.token;

    // Criar Bob
    await req("POST", "/auth/register", null, {
      nome: "Bob Amigo", email: "bob@test.com", senha: "123", cidade: "Braga", role: "user"
    });
    const loginB = await req("POST", "/auth/login", null, { email: "bob@test.com", senha: "123" });
    tokenUserB = loginB.token;


    // --- 2. GESTÃO DE EVENTOS ---
    console.log(`\n${CLR.blue}--- [2] EVENTOS (Organizador) ---${CLR.reset}`);

    const evento = await req("POST", "/events", tokenOrg, {
      titulo: "Tech Summit 2025",
      descricao: "O maior evento de tecnologia.",
      local: "Altice Arena",
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 86400000).toISOString(),
      carga_horaria: 8,
      max_inscricoes: 100
    });
    eventId = evento.id;

    await req("PUT", `/events/${eventId}`, tokenOrg, { titulo: "Tech Summit 2025 - CONFIRMADO" });
    await req("PATCH", `/events/${eventId}/publish`, tokenOrg, {});


    // --- 3. INSCRIÇÕES ---
    console.log(`\n${CLR.blue}--- [3] INSCRIÇÕES (Alice e Bob) ---${CLR.reset}`);

    const subA = await req("POST", `/events/${eventId}/register`, tokenUserA, {});
    regIdA = subA.id;

    const subB = await req("POST", `/events/${eventId}/register`, tokenUserB, {});
    regIdB = subB.id;

    console.log(`${CLR.yellow}🔍 Testando listagem de inscrições da Alice...${CLR.reset}`);
    const mySubs = await req("GET", "/registrations", tokenUserA);
    if (mySubs.length === 0) throw new Error("Lista de inscrições veio vazia!");


    // --- 4. SOCIAL (Alice e Bob) ---
    console.log(`\n${CLR.blue}--- [4] SOCIAL (Amizade e Chat) ---${CLR.reset}`);

    // Precisamos do ID do Bob. Vamos assumir que loginB retornou { user: { id: ... }, token: ... }
    const bobId = loginB.user.id; 

    const friendReq = await req("POST", "/social/friends/request", tokenUserA, { destinatarioId: bobId });
    friendshipId = friendReq.id;

    await req("PATCH", `/social/friends/${friendshipId}/respond`, tokenUserB, { action: "accept" });

    await req("POST", "/social/messages", tokenUserA, { destinatarioId: bobId, conteudo: "Oi Bob! Vamos nos encontrar no Coffee Break?" });

    // --- 5. CHECK-IN (Organizador) ---
    console.log(`\n${CLR.blue}--- [5] CHECK-IN E FINALIZAÇÃO ---${CLR.reset}`);

    await req("POST", "/checkins", tokenOrg, { registration_id: regIdA });
    await req("PUT", `/events/${eventId}`, tokenOrg, { status: "encerrado" });


    // --- 6. PÓS-EVENTO (Certificado e Review) ---
    console.log(`\n${CLR.blue}--- [6] PÓS-EVENTO (Alice) ---${CLR.reset}`);

    const cert = await req("GET", `/registrations/${regIdA}/certificate`, tokenUserA);
    console.log(`${CLR.blue}📜 Certificado Gerado: ${cert.certificado_id}${CLR.reset}`);

    await req("POST", `/reviews/events/${eventId}`, tokenUserA, { nota: 5, comentario: "Foi épico!" });
    await req("GET", `/reviews/events/${eventId}`);

    console.log(`\n${CLR.green}🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉${CLR.reset}`);

  } catch (err) {
    console.error(`\n${CLR.red}⛔ TESTE FALHOU.${CLR.reset}`);
    console.error(err);
  }
}

runTests();
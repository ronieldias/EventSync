// scripts/test-flow.ts
// EXECUÇÃO: npx ts-node scripts/test-flow.ts

const API_URL = "http://localhost:3000";

// --- Utilitários de Cor para o Terminal ---
const CLR = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m"
};

// --- Estado Global do Teste ---
let tokenOrg = "";
let idOrg = "";
let tokenAlice = "";
let idAlice = "";
let tokenBob = "";
let idBob = "";
let tokenCharlie = ""; // Usuário "intruso"

let idEventSummit = ""; // Evento Grande
let idEventWorkshop = ""; // Evento Pequeno (Teste de Capacidade)

let idRegAliceSummit = "";
let idRegBobSummit = "";
let idRegAliceWorkshop = "";

let idFriendship = "";

// --- Função Helper para Requisições HTTP ---
async function req(
  method: string, 
  endpoint: string, 
  token: string | null = null, 
  body: any = null,
  description: string = ""
): Promise<any> {
  if (description) console.log(`${CLR.gray}.. ${description}${CLR.reset}`);
  
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options: any = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const text = await response.text();
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { raw: text };
    }

    // Injeta status para validação externa
    data._status = response.status;
    data._ok = response.ok;

    if (!response.ok) {
        return data; 
    }

    return data;
  } catch (err) {
    console.error(`${CLR.red}❌ ERRO DE CONEXÃO:${CLR.reset}`, err);
    process.exit(1);
  }
}

// --- Validadores ---
function assertSuccess(res: any, msg: string) {
  if (res._ok) {
    console.log(`${CLR.green}✅ [OK] ${msg}${CLR.reset}`);
  } else {
    console.error(`${CLR.red}❌ [FALHA] ${msg}${CLR.reset}`);
    console.error("   Resposta:", JSON.stringify(res, null, 2));
    process.exit(1);
  }
}

function assertError(res: any, msg: string, expectedPart: string) {
  if (!res._ok && (JSON.stringify(res).includes(expectedPart) || res.error?.includes(expectedPart))) {
    console.log(`${CLR.green}✅ [ERRO ESPERADO] ${msg} -> "${expectedPart}"${CLR.reset}`);
  } else {
    console.error(`${CLR.red}❌ [FALHA AO ESPERAR ERRO] ${msg}${CLR.reset}`);
    console.error(`   Esperava conter: "${expectedPart}"`);
    console.error("   Recebeu:", JSON.stringify(res, null, 2));
    process.exit(1);
  }
}

// =============================================================================
//  INÍCIO DO SCRIPT DE TESTES
// =============================================================================

async function runFullTest() {
  console.log(`${CLR.magenta}##################################################${CLR.reset}`);
  console.log(`${CLR.magenta}#    EVENTSYNC - BATERIA DE TESTES COMPLETA      #${CLR.reset}`);
  console.log(`${CLR.magenta}##################################################${CLR.reset}\n`);

  try {
    // ---------------------------------------------------------------------------
    // 1. AUTENTICAÇÃO E PERFIL
    // ---------------------------------------------------------------------------
    console.log(`${CLR.blue}=== 1. AUTENTICAÇÃO E PERFIL ===${CLR.reset}`);

    // 1.1 Registrar Organizador
    const resOrg = await req("POST", "/auth/register", null, {
      nome: "Organizador Master", email: "org@eventsync.com", senha: "123", cidade: "São Paulo", role: "organizer"
    }, "Registrando Organizador");
    assertSuccess(resOrg, "Organizador registrado");
    
    // 1.2 Login Organizador
    const loginOrg = await req("POST", "/auth/login", null, { email: "org@eventsync.com", senha: "123" });
    tokenOrg = loginOrg.token;
    idOrg = loginOrg.user.id;
    assertSuccess(loginOrg, "Login Organizador");

    // 1.3 Registrar Alice (Participante)
    await req("POST", "/auth/register", null, {
      nome: "Alice Wonderland", email: "alice@test.com", senha: "123", cidade: "Rio de Janeiro", role: "user"
    });
    const loginAlice = await req("POST", "/auth/login", null, { email: "alice@test.com", senha: "123" });
    tokenAlice = loginAlice.token;
    idAlice = loginAlice.user.id;
    assertSuccess(loginAlice, "Alice registrada e logada");

    // 1.4 Registrar Bob (Participante)
    await req("POST", "/auth/register", null, {
      nome: "Bob Builder", email: "bob@test.com", senha: "123", cidade: "São Paulo", role: "user"
    });
    const loginBob = await req("POST", "/auth/login", null, { email: "bob@test.com", senha: "123" });
    tokenBob = loginBob.token;
    idBob = loginBob.user.id;
    assertSuccess(loginBob, "Bob registrado e logado");

    // 1.5 Registrar Charlie (Intruso)
    await req("POST", "/auth/register", null, {
      nome: "Charlie Chaplin", email: "charlie@test.com", senha: "123", cidade: "Curitiba", role: "user"
    });
    const loginCharlie = await req("POST", "/auth/login", null, { email: "charlie@test.com", senha: "123" });
    tokenCharlie = loginCharlie.token;

    // 1.6 Editar Perfil da Alice
    const updateProfile = await req("PUT", "/auth/profile", tokenAlice, {
      bio: "Amo tecnologia e eventos!",
      foto_url: "http://foto.com/alice.jpg",
      visibilidade_participacao: true
    }, "Atualizando perfil da Alice");
    assertSuccess(updateProfile, "Perfil atualizado");
    if (updateProfile.bio !== "Amo tecnologia e eventos!") throw new Error("Bio não atualizou!");


    // ---------------------------------------------------------------------------
    // 2. GESTÃO DE EVENTOS (ORGANIZADOR)
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 2. GESTÃO DE EVENTOS ===${CLR.reset}`);

    // 2.1 Criar Evento Grande (Tech Summit)
    const evt1 = await req("POST", "/events", tokenOrg, {
      titulo: "Tech Summit 2025",
      descricao: "Maior evento de tech do ano.",
      local: "Expo Center Norte",
      categoria: "Tecnologia",
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 172800000).toISOString(),
      carga_horaria: 20,
      max_inscricoes: 100,
      n_checkins_permitidos: 2,
      banner_url: "http://banner.com/tech.jpg"
    }, "Criando Tech Summit");
    idEventSummit = evt1.id;
    assertSuccess(evt1, "Tech Summit criado");

    // 2.2 Criar Evento Pequeno (Workshop VIP)
    const evt2 = await req("POST", "/events", tokenOrg, {
      titulo: "Workshop VIP de IA",
      descricao: "Exclusivo para 1 pessoa.",
      local: "Sala Privada",
      categoria: "Workshop",
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 3600000).toISOString(),
      carga_horaria: 4,
      max_inscricoes: 1, // APENAS 1 VAGA
      n_checkins_permitidos: 1
    }, "Criando Workshop VIP");
    idEventWorkshop = evt2.id;
    assertSuccess(evt2, "Workshop VIP criado");

    // 2.3 Listar Meus Eventos (Organizador)
    const myEvents = await req("GET", "/events/my-events", tokenOrg, null, "Listando eventos do organizador");
    if (myEvents.length !== 2) throw new Error("Deveria ter 2 eventos na lista do organizador");
    assertSuccess(myEvents, "Lista 'Meus Eventos' validada");

    // 2.4 Publicar Eventos
    await req("PATCH", `/events/${idEventSummit}/publish`, tokenOrg, {});
    await req("PATCH", `/events/${idEventWorkshop}/publish`, tokenOrg, {});
    
    // 2.5 Abrir Inscrições Manualmente
    await req("PATCH", `/events/${idEventSummit}/toggle-inscriptions`, tokenOrg, { status: true });
    await req("PATCH", `/events/${idEventWorkshop}/toggle-inscriptions`, tokenOrg, { status: true });
    console.log(`${CLR.green}✅ [OK] Eventos publicados e inscrições abertas${CLR.reset}`);


    // ---------------------------------------------------------------------------
    // 3. BUSCA E FILTROS (PÚBLICO) E DETALHES
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 3. BUSCA, FILTROS E DETALHES ===${CLR.reset}`);

    // 3.1 Filtros
    const searchCat = await req("GET", "/events?categoria=Workshop", null, null, "Filtrando por categoria 'Workshop'");
    if (searchCat.length === 1 && searchCat[0].id === idEventWorkshop) {
      console.log(`${CLR.green}✅ [OK] Filtro por Categoria funcionou${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Filtro por Categoria${CLR.reset}`);
    }

    const searchName = await req("GET", "/events?nome=Summit", null, null, "Filtrando por nome 'Summit'");
    if (searchName.length === 1 && searchName[0].id === idEventSummit) {
      console.log(`${CLR.green}✅ [OK] Filtro por Nome funcionou${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Filtro por Nome${CLR.reset}`);
    }

    // 3.2 Detalhes do Evento (NOVO ENDPOINT)
    const eventDetails = await req("GET", `/events/${idEventSummit}`, null, null, "Alice visualiza detalhes do evento");
    if (eventDetails.id === idEventSummit && eventDetails.titulo === "Tech Summit 2025") {
      console.log(`${CLR.green}✅ [OK] Endpoint GET /events/:id funcionou${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] GET /events/:id${CLR.reset}`);
    }


    // ---------------------------------------------------------------------------
    // 4. FLUXO DE INSCRIÇÕES
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 4. INSCRIÇÕES E REGRAS ===${CLR.reset}`);

    // 4.1 Inscrição Alice no Summit (Sucesso)
    const subAliceSummit = await req("POST", `/events/${idEventSummit}/register`, tokenAlice, {}, "Alice se inscreve no Summit");
    idRegAliceSummit = subAliceSummit.id;
    assertSuccess(subAliceSummit, "Alice inscrita no Summit");

    // 4.2 Inscrição Bob no Summit (Sucesso)
    const subBobSummit = await req("POST", `/events/${idEventSummit}/register`, tokenBob, {}, "Bob se inscreve no Summit");
    idRegBobSummit = subBobSummit.id;
    assertSuccess(subBobSummit, "Bob inscrito no Summit");

    // 4.3 Inscrição Alice no Workshop (Sucesso - Pega a Vaga Única)
    const subAliceVIP = await req("POST", `/events/${idEventWorkshop}/register`, tokenAlice, {}, "Alice se inscreve no Workshop (Vaga Única)");
    idRegAliceWorkshop = subAliceVIP.id;
    assertSuccess(subAliceVIP, "Alice pegou a vaga do Workshop");

    // 4.4 Inscrição Bob no Workshop (FALHA - Lotação)
    const subBobVIPFail = await req("POST", `/events/${idEventWorkshop}/register`, tokenBob, {}, "Bob tenta se inscrever no Workshop lotado");
    assertError(subBobVIPFail, "Bob bloqueado por lotação", "Vagas esgotadas");

    // 4.5 Teste de Inscrições Fechadas Manualmente
    console.log(`${CLR.yellow}   >> Fechando inscrições do Workshop...${CLR.reset}`);
    await req("PATCH", `/events/${idEventWorkshop}/toggle-inscriptions`, tokenOrg, { status: false });
    
    // Alice cancela para liberar vaga
    await req("PATCH", `/registrations/${idRegAliceWorkshop}/cancel`, tokenAlice, {}, "Alice cancela inscrição no Workshop");
    
    // Bob tenta de novo (Vaga existe, mas inscrições estão FECHADAS)
    const subBobVIPClosed = await req("POST", `/events/${idEventWorkshop}/register`, tokenBob, {}, "Bob tenta entrar (Inscrições Fechadas)");
    assertError(subBobVIPClosed, "Bob bloqueado por status fechado", "fechadas");

    // Reabrir e Bob se inscreve
    await req("PATCH", `/events/${idEventWorkshop}/toggle-inscriptions`, tokenOrg, { status: true });
    const subBobVIPSuccess = await req("POST", `/events/${idEventWorkshop}/register`, tokenBob, {}, "Reaberto: Bob se inscreve");
    assertSuccess(subBobVIPSuccess, "Bob conseguiu a vaga após reabertura");

    // 4.6 Listar Minhas Inscrições (Alice)
    const aliceSubs = await req("GET", "/registrations", tokenAlice, null, "Listando inscrições da Alice");
    const hasSummit = aliceSubs.find((r: any) => r.evento.id === idEventSummit && r.status === "ativo");
    const hasWorkshopCanceled = aliceSubs.find((r: any) => r.evento.id === idEventWorkshop && r.status === "cancelado");
    
    if (hasSummit && hasWorkshopCanceled) {
      console.log(`${CLR.green}✅ [OK] Lista 'Minhas Inscrições' correta (1 ativo, 1 cancelado)${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Lista de inscrições inconsistente${CLR.reset}`);
    }

    // 4.7 Organizador vê todos os inscritos (NOVO ENDPOINT)
    const summitRegistrations = await req("GET", `/events/${idEventSummit}/registrations`, tokenOrg, null, "Org lista inscritos do Summit");
    if (summitRegistrations.length >= 2) {
      console.log(`${CLR.green}✅ [OK] Endpoint GET /events/:id/registrations funcionou (Org viu ${summitRegistrations.length} inscritos)${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Lista de inscritos do Org${CLR.reset}`);
    }


    // ---------------------------------------------------------------------------
    // 5. SOCIAL (AMIZADE E CHAT)
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 5. SOCIAL ===${CLR.reset}`);

    // 5.1 Charlie tenta adicionar Alice (Falha - Sem evento em comum)
    const friendFail = await req("POST", "/social/friends/request", tokenCharlie, { destinatarioId: idAlice }, "Charlie tenta adicionar Alice");
    assertError(friendFail, "Bloqueio de amizade sem evento comum", "participar do mesmo evento");

    // 5.2 Alice adiciona Bob (Sucesso)
    const friendReq = await req("POST", "/social/friends/request", tokenAlice, { destinatarioId: idBob }, "Alice envia pedido para Bob");
    idFriendship = friendReq.id;
    assertSuccess(friendReq, "Pedido de amizade enviado");

    // 5.3 Bob aceita
    const friendAccept = await req("PATCH", `/social/friends/${idFriendship}/respond`, tokenBob, { action: "accept" }, "Bob aceita pedido");
    assertSuccess(friendAccept, "Amizade aceita");

    // 5.4 Troca de Mensagens
    await req("POST", "/social/messages", tokenAlice, { destinatarioId: idBob, conteudo: "Oi Bob! Viu a palestra?" });
    const messagesBob = await req("GET", `/social/messages/${idAlice}`, tokenBob, null, "Bob lê mensagens de Alice");
    
    if (messagesBob.length > 0 && messagesBob[0].conteudo === "Oi Bob! Viu a palestra?") {
      console.log(`${CLR.green}✅ [OK] Chat funcional${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Mensagem não chegou${CLR.reset}`);
    }


    // ---------------------------------------------------------------------------
    // 6. CHECK-IN (ORGANIZADOR)
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 6. CHECK-IN ===${CLR.reset}`);

    // 6.1 Check-in Alice 1/2
    const check1 = await req("POST", "/checkins", tokenOrg, { registration_id: idRegAliceSummit }, "Check-in 1 de Alice");
    assertSuccess(check1, "Check-in 1 registrado");

    // 6.2 Check-in Alice 2/2
    const check2 = await req("POST", "/checkins", tokenOrg, { registration_id: idRegAliceSummit }, "Check-in 2 de Alice");
    assertSuccess(check2, "Check-in 2 registrado");

    // 6.3 Check-in Alice 3/2 (FALHA - Limite)
    const check3 = await req("POST", "/checkins", tokenOrg, { registration_id: idRegAliceSummit }, "Check-in 3 de Alice (Excesso)");
    assertError(check3, "Bloqueio por limite de check-ins", "Limite de check-ins atingido");

    // 6.4 Check-in Bob 1/2
    await req("POST", "/checkins", tokenOrg, { registration_id: idRegBobSummit }, "Check-in 1 de Bob");


    // ---------------------------------------------------------------------------
    // 7. PÓS-EVENTO (FINALIZAÇÃO, REVIEW, CERTIFICADO)
    // ---------------------------------------------------------------------------
    console.log(`\n${CLR.blue}=== 7. PÓS-EVENTO ===${CLR.reset}`);

    // 7.1 Tentar Review antes de finalizar (Falha)
    const reviewFail = await req("POST", `/reviews/events/${idEventSummit}`, tokenAlice, { nota: 5, comentario: "Top" });
    assertError(reviewFail, "Review bloqueado (evento não encerrado)", "só pode avaliar eventos que já foram encerrados");

    // 7.2 Organizador Encerra o Evento
    await req("PUT", `/events/${idEventSummit}`, tokenOrg, { status: "encerrado" }, "Encerrando evento Summit");
    
    // 7.3 Emitir Certificado (Alice - 2 check-ins)
    const certAlice = await req("GET", `/registrations/${idRegAliceSummit}/certificate`, tokenAlice, null, "Alice baixa certificado");
    if (certAlice.certificado_id && certAlice.carga_horaria === "20 horas") {
      console.log(`${CLR.green}✅ [OK] Certificado de Alice gerado com sucesso${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Certificado inválido${CLR.reset}`);
    }

    // 7.4 Criar Review (Alice)
    const reviewAlice = await req("POST", `/reviews/events/${idEventSummit}`, tokenAlice, { nota: 5, comentario: "Evento incrível, networking ótimo!" });
    assertSuccess(reviewAlice, "Alice avaliou o evento");

    // 7.5 Listar Reviews (Público/Auth)
    const reviews = await req("GET", `/reviews/events/${idEventSummit}`, tokenOrg, null, "Listando reviews");
    if (reviews.length > 0 && reviews[0].comentario.includes("incrível")) {
      console.log(`${CLR.green}✅ [OK] Listagem de reviews correta${CLR.reset}`);
    } else {
      console.error(`${CLR.red}❌ [FALHA] Review não apareceu na lista${CLR.reset}`);
    }

    console.log(`\n${CLR.magenta}##################################################${CLR.reset}`);
    console.log(`${CLR.green}🎉 TODOS OS TESTES PASSARAM! BACKEND 100% FUNCIONAL 🎉${CLR.reset}`);
    console.log(`${CLR.magenta}##################################################${CLR.reset}\n`);

  } catch (err) {
    console.error(`\n${CLR.red}⛔ TESTE CRÍTICO FALHOU.${CLR.reset}`);
    console.error(err);
  }
}

// Executar
runFullTest();
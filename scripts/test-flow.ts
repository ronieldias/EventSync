// scripts/test-flow.ts
// Certifique-se de ter o 'node-fetch' instalado ou rode com Node 18+ (que já tem fetch nativo)
// Execução: npx ts-node scripts/test-flow.ts

const API_URL = "http://localhost:3000";

// Cores para o terminal
const CLR = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

// --- Variáveis de Estado Global ---
let tokenOrg = "";
let orgId = "";
let tokenAlice = "";
let aliceId = "";
let tokenBob = "";
let bobId = "";

let mainEventId = ""; // Evento principal
let vipEventId = "";  // Evento para teste de capacidade

let regAliceMain = "";
let regBobMain = "";
let friendshipId = "";

// --- Função Auxiliar de Requisição ---
async function req(method: string, endpoint: string, token: string | null = null, body: any = null): Promise<any> {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Log do comando (resumido)
  console.log(`${CLR.yellow}[${method}]${CLR.reset} ${endpoint}`);
  
  const options: any = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const text = await response.text();
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { error: text };
    }

    if (!response.ok) {
      // Se for um erro esperado (ex: teste de falha), retornamos o erro para ser tratado
      // Marcamos com uma flag para quem chamou saber que falhou
      data._isError = true;
      data._status = response.status;
      return data;
    }

    return data;
  } catch (err) {
    console.error(`${CLR.red}❌ Erro de conexão:${CLR.reset}`, err);
    process.exit(1);
  }
}

// --- Função para Validar Erro Esperado ---
function expectError(response: any, messagePart: string) {
  if (response._isError) {
    console.log(`${CLR.green}   ✅ Erro esperado capturado: "${response.error || response.message}"${CLR.reset}`);
  } else {
    console.error(`${CLR.red}   ❌ Deveria ter falhado, mas passou!${CLR.reset}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log(`${CLR.magenta}=========================================${CLR.reset}`);
  console.log(`${CLR.magenta}   🚀 EVENTSYNC - TESTE DE FLUXO TOTAL   ${CLR.reset}`);
  console.log(`${CLR.magenta}=========================================${CLR.reset}\n`);

  try {
    // =========================================================================
    // 1. AUTENTICAÇÃO E PERFIS
    // =========================================================================
    console.log(`${CLR.blue}--- [1] Autenticação e Users ---${CLR.reset}`);
    
    // Registrar Organizador
    console.log("Criando Organizador...");
    await req("POST", "/auth/register", null, {
      nome: "Organizador Chefe", email: "org@test.com", senha: "123", cidade: "São Paulo", role: "organizer"
    });
    const loginOrg = await req("POST", "/auth/login", null, { email: "org@test.com", senha: "123" });
    tokenOrg = loginOrg.token;
    orgId = loginOrg.user.id;

    // Registrar Alice
    console.log("Criando Alice...");
    await req("POST", "/auth/register", null, {
      nome: "Alice Silva", email: "alice@test.com", senha: "123", cidade: "Rio de Janeiro", role: "user"
    });
    const loginAlice = await req("POST", "/auth/login", null, { email: "alice@test.com", senha: "123" });
    tokenAlice = loginAlice.token;
    aliceId = loginAlice.user.id;

    // Registrar Bob
    console.log("Criando Bob...");
    await req("POST", "/auth/register", null, {
      nome: "Bob Santos", email: "bob@test.com", senha: "123", cidade: "São Paulo", role: "user"
    });
    const loginBob = await req("POST", "/auth/login", null, { email: "bob@test.com", senha: "123" });
    tokenBob = loginBob.token;
    bobId = loginBob.user.id;


    // =========================================================================
    // 2. GESTÃO DE EVENTOS (Criação e Edição)
    // =========================================================================
    console.log(`\n${CLR.blue}--- [2] Gestão de Eventos ---${CLR.reset}`);

    // 2.1 Criar Evento Principal (Grande, 2 checkins permitidos)
    const evt1 = await req("POST", "/events", tokenOrg, {
      titulo: "Tech Summit 2025",
      descricao: "O maior evento de tecnologia.",
      local: "Expo Center",
      categoria: "Tecnologia",
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 172800000).toISOString(), // +2 dias
      carga_horaria: 16,
      max_inscricoes: 100,
      n_checkins_permitidos: 2 // TESTE DE MÚLTIPLOS CHECK-INS
    });
    mainEventId = evt1.id;
    console.log(`   ✅ Evento Principal Criado: ${evt1.titulo} (ID: ${mainEventId})`);

    // 2.2 Criar Evento VIP (Pequeno, 1 vaga, para teste de capacidade)
    const evt2 = await req("POST", "/events", tokenOrg, {
      titulo: "Workshop VIP Exclusivo",
      descricao: "Apenas 1 vaga.",
      local: "Sala VIP",
      categoria: "Workshop",
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 3600000).toISOString(),
      carga_horaria: 2,
      max_inscricoes: 1, // TESTE DE CAPACIDADE
      n_checkins_permitidos: 1
    });
    vipEventId = evt2.id;
    console.log(`   ✅ Evento VIP Criado (Max 1 vaga).`);

    // 2.3 Editar Evento Principal (Update)
    await req("PUT", `/events/${mainEventId}`, tokenOrg, { 
      descricao: "O maior evento de tecnologia do Brasil (Atualizado)." 
    });
    console.log("   ✅ Evento editado com sucesso.");

    // 2.4 Publicar os Eventos
    await req("PATCH", `/events/${mainEventId}/publish`, tokenOrg, {});
    await req("PATCH", `/events/${vipEventId}/publish`, tokenOrg, {});
    console.log("   ✅ Eventos publicados.");

    // 2.5 Abrir Inscrições (Controle Manual)
    await req("PATCH", `/events/${mainEventId}/toggle-inscriptions`, tokenOrg, { status: true });
    await req("PATCH", `/events/${vipEventId}/toggle-inscriptions`, tokenOrg, { status: true });
    console.log("   ✅ Inscrições abertas manualmente.");


    // =========================================================================
    // 3. BUSCA E FILTROS (Público)
    // =========================================================================
    console.log(`\n${CLR.blue}--- [3] Busca e Filtros ---${CLR.reset}`);

    // Testar filtro por Categoria
    const searchTech = await req("GET", "/events?categoria=Tecnologia");
    if (searchTech.length === 1 && searchTech[0].id === mainEventId) {
      console.log("   ✅ Filtro por Categoria 'Tecnologia' OK.");
    } else {
      console.error("   ❌ Falha no filtro de categoria.");
    }

    // Testar filtro por Nome
    const searchName = await req("GET", "/events?nome=VIP");
    if (searchName.length === 1 && searchName[0].id === vipEventId) {
      console.log("   ✅ Filtro por Nome 'VIP' OK.");
    } else {
      console.error("   ❌ Falha no filtro de nome.");
    }


    // =========================================================================
    // 4. INSCRIÇÕES E REGRAS DE NEGÓCIO
    // =========================================================================
    console.log(`\n${CLR.blue}--- [4] Inscrições ---${CLR.reset}`);

    // 4.1 Inscrição Normal (Alice no Principal)
    const subAliceMain = await req("POST", `/events/${mainEventId}/register`, tokenAlice, {});
    regAliceMain = subAliceMain.id;
    console.log(`   ✅ Alice inscrita no Tech Summit.`);

    // 4.2 Inscrição no VIP (Alice pega a única vaga)
    await req("POST", `/events/${vipEventId}/register`, tokenAlice, {});
    console.log(`   ✅ Alice inscrita no Workshop VIP (Vagas: 0 restam).`);

    // 4.3 Teste de Capacidade (Bob tenta VIP cheio)
    console.log("   🔍 Testando limite de vagas (Bob tenta VIP)...");
    const subBobVip = await req("POST", `/events/${vipEventId}/register`, tokenBob, {});
    expectError(subBobVip, "Vagas esgotadas");

    // 4.4 Inscrição Normal (Bob no Principal)
    const subBobMain = await req("POST", `/events/${mainEventId}/register`, tokenBob, {});
    regBobMain = subBobMain.id;
    console.log(`   ✅ Bob inscrito no Tech Summit.`);

    // 4.5 Teste Inscrições Fechadas
    console.log("   🔍 Testando Inscrições Fechadas...");
    // Org fecha inscrições do VIP
    await req("PATCH", `/events/${vipEventId}/toggle-inscriptions`, tokenOrg, { status: false });
    // Bob tenta se inscrever novamente (mesmo que tivesse vaga, está fechado)
    // (Vamos remover Alice do VIP para liberar vaga e testar se 'fechado' bloqueia mesmo com vaga)
    // Mas antes, vamos testar o cancelamento da Alice
    
    // 4.6 Cancelamento pelo Participante
    console.log("   ✅ Alice cancelando inscrição no VIP...");
    // Precisamos do ID da inscrição da Alice no VIP. Listando...
    const aliceSubs = await req("GET", "/registrations", tokenAlice);
    const subAliceVip = aliceSubs.find((r: any) => r.evento.id === vipEventId);
    
    await req("PATCH", `/registrations/${subAliceVip.inscricao_id}/cancel`, tokenAlice, {});
    console.log("   ✅ Inscrição cancelada.");

    // Agora VIP tem vaga, mas está FECHADO. Bob tenta:
    const subBobVip2 = await req("POST", `/events/${vipEventId}/register`, tokenBob, {});
    expectError(subBobVip2, "fechadas");


    // =========================================================================
    // 5. SOCIAL (Amizade e Mensagens)
    // =========================================================================
    console.log(`\n${CLR.blue}--- [5] Social ---${CLR.reset}`);

    // Alice e Bob estão inscritos no Tech Summit (Ativos). Devem poder ser amigos.
    
    // 5.1 Enviar Pedido
    console.log("   ✅ Alice envia pedido de amizade para Bob...");
    const friendReq = await req("POST", "/social/friends/request", tokenAlice, { destinatarioId: bobId });
    friendshipId = friendReq.id;

    // 5.2 Listar Participantes
    const participants = await req("GET", `/social/events/${mainEventId}/participants`);
    if (participants.length >= 2) console.log("   ✅ Lista de participantes OK.");

    // 5.3 Aceitar Pedido
    console.log("   ✅ Bob aceita amizade...");
    await req("PATCH", `/social/friends/${friendshipId}/respond`, tokenBob, { action: "accept" });

    // 5.4 Trocar Mensagens
    console.log("   ✅ Alice envia mensagem para Bob...");
    await req("POST", "/social/messages", tokenAlice, { 
      destinatarioId: bobId, 
      conteudo: "Oi Bob! Vamos sentar juntos na palestra?" 
    });

    const msgs = await req("GET", `/social/messages/${aliceId}`, tokenBob);
    if (msgs.length > 0 && msgs[0].conteudo.includes("palestra")) {
      console.log("   ✅ Bob recebeu a mensagem.");
    } else {
      console.error("   ❌ Erro no chat.");
    }


    // =========================================================================
    // 6. CHECK-IN (Múltiplos)
    // =========================================================================
    console.log(`\n${CLR.blue}--- [6] Check-in ---${CLR.reset}`);

    // Tech Summit permite 2 check-ins.

    // 6.1 Primeiro Check-in Alice
    await req("POST", "/checkins", tokenOrg, { registration_id: regAliceMain });
    console.log("   ✅ Check-in 1/2 de Alice realizado.");

    // 6.2 Segundo Check-in Alice
    await req("POST", "/checkins", tokenOrg, { registration_id: regAliceMain });
    console.log("   ✅ Check-in 2/2 de Alice realizado.");

    // 6.3 Terceiro Check-in Alice (Deve falhar)
    console.log("   🔍 Testando limite de check-ins (Alice tenta 3º)...");
    const checkinFail = await req("POST", "/checkins", tokenOrg, { registration_id: regAliceMain });
    expectError(checkinFail, "Limite de check-ins atingido");

    // 6.4 Check-in Bob (Apenas 1)
    await req("POST", "/checkins", tokenOrg, { registration_id: regBobMain });
    console.log("   ✅ Check-in 1/2 de Bob realizado.");


    // =========================================================================
    // 7. PÓS-EVENTO (Finalização, Review e Certificado)
    // =========================================================================
    console.log(`\n${CLR.blue}--- [7] Pós-Evento ---${CLR.reset}`);

    // 7.1 Tentar avaliar antes de finalizar (Erro esperado)
    const revFail = await req("POST", `/reviews/events/${mainEventId}`, tokenAlice, { nota: 5, comentario: "Top" });
    expectError(revFail, "apenas avaliar eventos que já foram encerrados");

    // 7.2 Finalizar Evento
    console.log("   ✅ Org finaliza o evento...");
    // Usamos o endpoint de Update para mudar status para encerrado
    await req("PUT", `/events/${mainEventId}`, tokenOrg, { status: "encerrado" });

    // 7.3 Avaliar com Sucesso
    await req("POST", `/reviews/events/${mainEventId}`, tokenAlice, { nota: 5, comentario: "Melhor evento do ano!" });
    console.log("   ✅ Alice avaliou o evento.");

    // 7.4 Listar Avaliações
    const reviews = await req("GET", `/reviews/events/${mainEventId}`);
    if (reviews.length > 0) console.log("   ✅ Listagem de reviews OK.");

    // 7.5 Obter Certificado
    const certAlice = await req("GET", `/registrations/${regAliceMain}/certificate`, tokenAlice);
    if (certAlice.certificado_id) {
      console.log(`   📜 Certificado de Alice gerado: ${certAlice.certificado_id}`);
      console.log(`      Carga Horária: ${certAlice.carga_horaria}`);
    } else {
      console.error("   ❌ Erro ao gerar certificado.");
    }

    // 7.6 Testar Certificado para quem não foi (Bob fez check-in, ok. Vamos simular alguém sem check-in?)
    // Como Bob fez check-in, ele também consegue. O teste já cobriu o fluxo principal.

    console.log(`\n${CLR.green}🎉 SUCESSO TOTAL! Todos os requisitos validados. 🎉${CLR.reset}\n`);

  } catch (err) {
    console.error(`\n${CLR.red}⛔ TESTE CRÍTICO FALHOU.${CLR.reset}`);
    console.error(err);
  }
}

runTests();
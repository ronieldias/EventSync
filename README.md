# EventSync API

API REST para gerenciamento de eventos acadêmicos. Organizadores criam e gerenciam eventos, participantes se inscrevem e acompanham suas inscrições.

## Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| Node.js | Runtime JavaScript |
| TypeScript | Tipagem estática |
| Express | Framework web |
| TypeORM | ORM para banco de dados |
| PostgreSQL | Banco de dados relacional |
| JWT | Autenticação via tokens |
| Zod | Validação de dados |
| Swagger | Documentação da API |

## Arquitetura

O projeto segue os princípios da **Clean Architecture**:

```
src/
├── domain/                     # Camada de domínio
│   ├── entities/               # Entidades de negócio
│   └── repositories/           # Interfaces dos repositórios
│
├── infrastructure/             # Camada de infraestrutura
│   ├── database/
│   │   ├── entities/           # Entidades do TypeORM
│   │   ├── repositories/       # Implementações dos repositórios
│   │   └── migrations/         # Migrações do banco
│   ├── http/
│   │   ├── controllers/        # Controllers
│   │   ├── routes/             # Rotas da API
│   │   ├── middlewares/        # Middlewares (auth, errors)
│   │   └── swagger.ts          # Configuração do Swagger
│   └── services/               # Serviços (scheduler)
│
└── shared/                     # Código compartilhado
    └── errors/                 # Tratamento de erros
```

## Endpoints

| Módulo | Endpoints | Autenticação |
|--------|-----------|--------------|
| Auth | 2 | Não |
| Users | 5 | Sim |
| Events | 12 | Parcial |
| Notifications | 6 | Sim |

**Total: 25 endpoints**

> Documentação completa disponível no Swagger

## Como Rodar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou Docker)

### Banco de Dados

```bash
# Com Docker
docker-compose up -d
```

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar migrações
npm run migration:run

# Iniciar em desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3333`

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm start` | Servidor de produção |
| `npm run migration:run` | Executar migrações |
| `npm run migration:revert` | Reverter última migração |

## Swagger (Documentação)

Acesse a documentação interativa em:

```
http://localhost:3333/api/docs
```

### Como autenticar no Swagger

1. Execute `POST /auth/login` com suas credenciais
2. Copie o `token` da resposta
3. Clique no botão **Authorize** (cadeado no topo)
4. Cole o token no formato: `Bearer seu_token_aqui`
5. Clique em **Authorize** e depois **Close**

Agora você pode testar endpoints autenticados.

## Funcionalidades

**Organizadores:**
- Criar, editar e excluir eventos
- Controlar status (rascunho → publicado → em andamento → finalizado)
- Abrir/fechar inscrições
- Gerenciar participantes
- Enviar notificações

**Participantes:**
- Visualizar eventos disponíveis
- Inscrever-se e cancelar inscrições
- Receber notificações

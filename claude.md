# CLAUDE.md — Meraki v1.0
> Plataforma de contratação baseada em projetos técnicos com licitação, milestones e pagamentos verificáveis.
> Leia este arquivo inteiro antes de escrever qualquer linha de código.

---

## 1. Stack Obrigatória

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + TypeScript |
| Banco de dados | PostgreSQL (um por serviço) |
| Mensageria | RabbitMQ ou Kafka |
| Infraestrutura | Docker + Docker Compose |
| Frontend | Flutter |
| Auth | JWT |
| Documentação de API | OpenAPI / Swagger |

### Proibições absolutas de stack
- **Nunca** use SQLite, banco em memória, H2, fake DB ou qualquer substituto de PostgreSQL
- **Nunca** use mock de mensageria (ex: fake RabbitMQ, in-memory queue)
- **Nunca** substitua Docker por execução local de serviços
- **Nunca** use `any` em TypeScript sem justificativa documentada no próprio arquivo
- **Nunca** misture responsabilidades entre microserviços (ex: payment-service acessando tabelas do user-service)

---

## 2. Arquitetura

O projeto segue **DDD + Microserviços**. Cada serviço é independente e possui:
- Banco de dados próprio (PostgreSQL isolado)
- API REST documentada
- Comunicação com outros serviços **exclusivamente via eventos** (RabbitMQ/Kafka)
- Sem acesso direto ao banco de outro serviço

### Serviços
```
api-gateway         → roteamento, autenticação JWT, rate limiting
user-service        → User, Company, Specialist (cadastro e auth)
project-service     → Project, Milestone (criação e gestão)
bidding-service     → Bid (propostas e avaliação)
delivery-service    → Kanban, progresso de milestones
payment-service     → Payment, taxa da plataforma, liberação pós-validação
portfolio-service   → ProjectHistory, perfil público
```

### Comunicação entre serviços
- Serviços **não fazem chamadas HTTP diretas entre si** (exceto via api-gateway para o cliente)
- Toda comunicação interna ocorre via **eventos assíncronos**
- Exemplos de eventos: `milestone.validated`, `payment.released`, `bid.accepted`, `project.completed`

---

## 3. Entidades e Bounded Contexts

```
Identity & Access   → User, Company, Specialist
Project Management  → Project, Milestone
Bidding             → Bid
Delivery Tracking   → KanbanBoard, KanbanCard
Payment             → Payment, PlatformFee
Portfolio           → ProjectHistory, PublicProfile
```

---

## 4. Regras de Negócio — NUNCA viole estas regras

| ID | Regra |
|---|---|
| RN01 | Projetos só aceitam propostas após validação de qualidade do escopo |
| RN02 | Cada especialista pode ter apenas uma proposta ativa por projeto |
| RN03 | Apenas um especialista vencedor por projeto |
| RN04 | Milestones são concluídas sequencialmente — a próxima só abre após validação da anterior |
| RN05 | Pagamento é liberado **somente** após validação da milestone pela empresa |
| RN06 | A plataforma retém uma taxa percentual a cada pagamento liberado |
| RN07 | O histórico de entregas é registrado automaticamente pelo sistema |

---

## 5. Requisitos Funcionais (backlog de implementação)

Implemente na ordem abaixo. Não pule etapas.

- [ ] RF01 — Cadastro de empresas
- [ ] RF02 — Cadastro de especialistas
- [ ] RF03 — Criação de projetos
- [ ] RF04 — Definição de milestones por projeto
- [ ] RF05 — Envio de propostas por especialistas
- [ ] RF06 — Avaliação de propostas pela empresa
- [ ] RF07 — Seleção do especialista vencedor
- [ ] RF08 — Acompanhamento de progresso via Kanban
- [ ] RF09 — Validação de milestones pela empresa
- [ ] RF10 — Liberação de pagamento após validação de milestone
- [ ] RF11 — Acesso ao histórico de entregas
- [ ] RF12 — Perfil público de especialistas
- [ ] RF13 — Perfil público de empresas
- [ ] RF14 — Acesso ao histórico profissional dos especialistas

---

## 6. Requisitos Não Funcionais

- **RNF01** — Autenticação via JWT em todas as rotas protegidas
- **RNF02** — Suporte a múltiplos usuários simultâneos (sem estado compartilhado em memória)
- **RNF03** — Arquitetura DDD + Microserviços (respeitar bounded contexts)
- **RNF04** — Consistência transacional financeira (pagamentos devem ser idempotentes)
- **RNF05** — Alta disponibilidade (serviços stateless, prontos para múltiplas instâncias)
- **RNF06** — Logs de auditoria em todas as operações financeiras e de validação
- **RNF07** — API REST documentada com OpenAPI/Swagger por serviço
- **RNF08** — Proteção contra SQL Injection, XSS e CSRF
- **RNF09** — Banco de dados independente por microserviço
- **RNF10** — Comunicação entre serviços baseada em eventos

---

## 7. Padrões de Código

### Estrutura de pastas por serviço
```
user-service/
├── src/
│   ├── domain/          → entidades, value objects, regras de negócio
│   ├── application/     → use cases, DTOs
│   ├── infrastructure/  → repositórios, ORM, mensageria
│   └── interface/       → controllers REST, middlewares
├── tests/
├── Dockerfile
└── package.json
```

### Convenções
- Todos os use cases ficam em `application/`
- Regras de negócio ficam em `domain/` — nunca em controllers
- Erros de domínio são classes explícitas (ex: `MilestoneNotSequentialError`)
- Toda função pública tem tipagem completa (sem `any`)
- Testes unitários obrigatórios para todas as regras de negócio do domain

---

## 8. Protocolo de Bloqueio — LEIA COM ATENÇÃO

Se você encontrar qualquer um dos bloqueios abaixo, **PARE IMEDIATAMENTE**:

- Docker não está rodando
- PostgreSQL inacessível
- RabbitMQ/Kafka inacessível
- Variável de ambiente ausente
- Certificado ou credencial faltando
- Dependência de outro serviço não implementado ainda

### O que fazer ao bloquear:
1. **NÃO tente workarounds** (banco local, mock, fake, in-memory, etc.)
2. **NÃO continue implementando** fingindo que o bloqueio não existe
3. Crie um arquivo `BLOCKED.md` na raiz do projeto com:
   - Qual serviço está bloqueado
   - Qual é o bloqueio exato
   - O que é necessário para desbloquear
   - Quais tarefas dependem desse desbloqueio
4. Pare e aguarde intervenção humana

### Exemplo de BLOCKED.md
```markdown
# BLOQUEIO DETECTADO

**Serviço:** payment-service  
**Problema:** PostgreSQL não responde em localhost:5432  
**Necessário:** Rodar `docker-compose up -d postgres` antes de continuar  
**Impacto:** RF10 (liberação de pagamento) está bloqueado  
```

> Parar e reportar um bloqueio é a resposta correta.
> Entregar uma solução com infraestrutura diferente da especificada é um erro grave, não uma ajuda.

---

## 9. Docker e Infraestrutura

### Estrutura de deploy

Cada serviço é implantado de forma **completamente independente**, em seu próprio servidor:

```
backend/
├── docker-compose.infra.yml        → RabbitMQ central (servidor de infra dedicado)
├── docker-compose.yml              → SOMENTE para desenvolvimento local monorepo
│
├── api-gateway/
│   ├── docker-compose.yml          → deploy isolado do gateway (sem banco)
│   └── .env.example
│
├── identity-service/
│   ├── docker-compose.yml          → serviço + PostgreSQL próprio
│   └── .env.example
│
├── project-service/   (mesma estrutura)
├── bidding-service/   (mesma estrutura)
├── delivery-service/  (mesma estrutura)
├── payment-service/   (mesma estrutura)
└── portfolio-service/ (mesma estrutura)
```

### Regras de infraestrutura

- Cada serviço tem seu próprio `Dockerfile` e `docker-compose.yml`
- Cada serviço sobe com seu próprio PostgreSQL (porta padrão `5432` no container)
- O RabbitMQ é centralizado e compartilhado — configurado via `docker-compose.infra.yml`
- Todos os serviços apontam para o RabbitMQ externo via `RABBITMQ_URL` (variável de ambiente)
- O `api-gateway` é stateless — não tem banco, só aponta para os outros via `*_SERVICE_URL`
- Variáveis de ambiente ficam em `.env` (nunca hardcoded)
- Nunca suba credenciais no código
- O `JWT_SECRET` deve ser **idêntico** em todos os servidores

### Portas padrão por serviço

| Serviço | Porta |
|---|---|
| api-gateway | 3000 |
| identity-service | 3001 |
| project-service | 3002 |
| bidding-service | 3003 |
| delivery-service | 3004 |
| payment-service | 3005 |
| portfolio-service | 3006 |

Consulte `backend/DEPLOY.md` para o guia completo de deploy distribuído.

---

## 10. O que nunca fazer (resumo rápido)

- ❌ Banco fake, SQLite, in-memory
- ❌ Mock de mensageria
- ❌ Serviço acessando banco de outro serviço diretamente
- ❌ Regra de negócio fora do domain/
- ❌ Pagamento sem validação de milestone
- ❌ Milestone fora de ordem
- ❌ `any` sem justificativa
- ❌ Continuar codando após bloqueio de infraestrutura
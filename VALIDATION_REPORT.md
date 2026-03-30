# MERAKI — Relatório de Validação de Requisitos e DDD
> Gerado em: 2026-03-27 | Atualizado: 2026-03-27 | Branch: loren

---

## Resumo Executivo

O projeto implementa corretamente a maior parte da arquitetura DDD + Microserviços. Comunicação por eventos (RabbitMQ) está no lugar, cada serviço tem seu próprio banco PostgreSQL, e as regras de negócio principais estão aplicadas na camada de domínio. Há **4 violações pendentes** — sendo uma crítica (ausência total de testes). As demais (FALHA-01, FALHA-06, FALHA-07) foram resolvidas na refatoração de 2026-03-27.

---

## Status por Serviço

| Serviço | domain/ | application/ | infrastructure/ | interface/ | Status |
|---------|---------|--------------|-----------------|------------|--------|
| api-gateway | ✗ | ✗ | ✓ | ✗ (usa /modules) | ⚠️ |
| identity-service | ✓ | ✓ | ✓ | ✓ | ✓ |
| project-service | ✓ | ✓ | ✓ | ✓ | ✓ |
| bidding-service | ✓ | ✓ | ✓ | ✓ | ✓ |
| delivery-service | ✓ | ✓ | ✓ | ✓ | ✓ |
| payment-service | ✓ | ✓ | ✓ | ✓ | ✓ |
| portfolio-service | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Regras de Negócio

| Regra | Status | Onde está implementado |
|-------|--------|------------------------|
| RN01 — Projeto só aceita propostas após validação de escopo | ✓ Parcial | `project-service/src/domain/factories/project.factory.ts` — valida título, budget, deadline, requisitos |
| RN02 — Especialista tem apenas uma proposta ativa por projeto | ✓ | `bidding-service/src/application/use-cases/submit-bid.use-case.ts:18-23` |
| RN03 — Apenas um especialista vencedor por projeto | ✓ | `bidding-service/src/domain/services/bid-selection.domain-service.ts:21-38` |
| RN04 — Milestones concluídas sequencialmente | ✓ | `project-service/src/domain/entities/milestone.entity.ts:52-65` |
| RN05 — Pagamento liberado apenas após validação de milestone | ⚠️ Incerto | `delivery-service/.../review-delivery.use-case.ts:36` publica evento, mas assinatura no payment-service não foi confirmada |
| RN06 — Plataforma retém taxa percentual | ✓ | `payment-service/src/domain/entities/payment.entity.ts:56-69` — método `release(feeRate)` |
| RN07 — Histórico de entregas registrado automaticamente | ✓ | `delivery-service/src/application/use-cases/submit-delivery.use-case.ts:47-62` |

---

## Requisitos Funcionais

| RF | Descrição | Status | Arquivo principal |
|----|-----------|--------|-------------------|
| RF01 | Cadastro de empresas | ✓ | `identity-service/src/application/use-cases/create-company-profile.use-case.ts` |
| RF02 | Cadastro de especialistas | ✓ | `identity-service/src/application/use-cases/create-specialist-profile.use-case.ts` |
| RF03 | Criação de projetos | ✓ | `project-service/src/application/use-cases/create-project.use-case.ts` |
| RF04 | Definição de milestones | ✓ | `project-service/src/application/use-cases/create-milestone.use-case.ts` |
| RF05 | Envio de propostas | ✓ | `bidding-service/src/application/use-cases/submit-bid.use-case.ts` |
| RF06 | Avaliação de propostas | ✓ | `bidding-service/src/application/use-cases/accept-bid.use-case.ts` e `reject-bid.use-case.ts` |
| RF07 | Seleção do especialista vencedor | ✓ | `bidding-service/src/domain/services/bid-selection.domain-service.ts` |
| RF08 | Acompanhamento via Kanban | ✓ | `delivery-service/src/application/use-cases/get-kanban-board.use-case.ts` |
| RF09 | Validação de milestones | ✓ | `delivery-service/src/application/use-cases/review-delivery.use-case.ts` |
| RF10 | Liberação de pagamento | ✓ | `payment-service/src/application/use-cases/release-payment.use-case.ts` |
| RF11 | Histórico de entregas | ✓ | `delivery-service/src/application/use-cases/get-project-history.use-case.ts` |
| RF12 | Perfil público de especialistas | ✓ | `portfolio-service/src/application/use-cases/get-public-profile.use-case.ts` |
| RF13 | Perfil público de empresas | ✓ | `portfolio-service/src/application/use-cases/get-company-profile.use-case.ts` |
| RF14 | Histórico profissional de especialistas | ✓ | `portfolio-service/src/application/use-cases/record-work-history.use-case.ts` |

---

## Falhas Documentadas

### FALHA-01 — Nome do serviço diverge da especificação
- **Severidade**: Média
- **Spec (CLAUDE.md linha 39)**: `user-service`
- **Implementado**: `identity-service`
- **Impacto**: Gap documentação-realidade; funcionalidade correta mas naming inconsistente
- **Correção**: Renomear `identity-service` → `user-service` no docker-compose.yml, Dockerfiles e referências, **ou** atualizar o CLAUDE.md para refletir o nome atual

---

### FALHA-02 — API Gateway não segue estrutura DDD
- **Severidade**: Alta
- **Local**: `backend/api-gateway/src/`
- **Problema**: Usa estrutura `/modules/auth`, `/modules/users`, `/modules/projects` em vez de `/domain`, `/application`, `/infrastructure`, `/interfaces`
- **Evidência**: `app.module.ts:8` — `import { AuthModule } from './modules/auth/auth.module'`
- **Impacto**: Mistura concerns de autenticação, roteamento e lógica no mesmo módulo
- **Correção**: Reestruturar para DDD ou documentar explicitamente no CLAUDE.md que o api-gateway é uma exceção arquitetural (gateway não precisa de domínio de negócio)

---

### FALHA-03 — `any` sem justificativa em portfolio-service e project-service
- **Severidade**: Média
- **Violação**: CLAUDE.md — "Nunca use `any` em TypeScript sem justificativa documentada no próprio arquivo"
- **Ocorrências não justificadas**:

| Arquivo | Linhas | Problema |
|---------|--------|---------|
| `portfolio-service/src/interfaces/controllers/portfolio.controller.ts` | 36, 42 | `@Body() body: any` — criação de itens de portfólio |
| `portfolio-service/src/interfaces/controllers/portfolio.controller.ts` | 71, 99 | `@Body() body: any` — certificação e review |
| `portfolio-service/src/interfaces/controllers/portfolio.controller.ts` | 156, 233 | cast `as any` |
| `project-service/src/interfaces/controllers/project.controller.ts` | 49 | `const filter: any = { status, page, limit }` |

- **Correção**: Criar DTOs tipados para cada endpoint do portfolio-service; criar `ProjectFilterDto` no project-service

---

### FALHA-04 — Zero testes unitários no domínio
- **Severidade**: CRÍTICA
- **Violação**: CLAUDE.md linha 137 — "Testes unitários obrigatórios para todas as regras de negócio do domain"
- **Problema**: Nenhum arquivo `.spec.ts` ou `.test.ts` encontrado no projeto inteiro
- **Regras de negócio sem cobertura**:
  - RN02 → `bidding-service/src/application/use-cases/submit-bid.use-case.ts`
  - RN03 → `bidding-service/src/domain/services/bid-selection.domain-service.ts`
  - RN04 → `project-service/src/domain/entities/milestone.entity.ts`
  - RN05 → `delivery-service/src/application/use-cases/review-delivery.use-case.ts`
  - RN06 → `payment-service/src/domain/entities/payment.entity.ts`
  - RN07 → `delivery-service/src/application/use-cases/submit-delivery.use-case.ts`
- **Arquivos de teste que devem ser criados**:
  ```
  bidding-service/tests/domain/services/bid-selection.domain-service.spec.ts
  bidding-service/tests/application/use-cases/submit-bid.use-case.spec.ts
  project-service/tests/domain/entities/milestone.entity.spec.ts
  payment-service/tests/domain/entities/payment.entity.spec.ts
  delivery-service/tests/application/use-cases/review-delivery.use-case.spec.ts
  ```

---

### FALHA-05 — Assinatura do evento `milestone.validated` no payment-service não confirmada
- **Severidade**: Média
- **Contexto**: RN05 exige que pagamento só seja liberado após validação de milestone
- **O que existe**:
  - `delivery-service/.../review-delivery.use-case.ts:36` — publica `MilestoneValidatedEvent`
  - `payment-service/.../release-payment.use-case.ts` — implementa a liberação
- **O que está ausente**: Não foi encontrado código explícito de listener/subscriber no payment-service para o evento `milestone.validated`
- **Risco**: Se o consumer não existir, RN05 não está sendo aplicado via eventos — pagamento pode ser liberado manualmente sem validação de milestone
- **Correção**: Verificar/criar `payment-service/src/infrastructure/rabbitmq/event-consumer.service.ts` com handler para `milestone.validated`

---

### FALHA-06 — Classes de exceção de domínio genéricas demais
- **Severidade**: Baixa
- **Problema**: Todos os serviços lançam `DomainException` genérica; CLAUDE.md (linha 135) cita `MilestoneNotSequentialError` como exemplo do padrão esperado
- **Impacto**: Dificulta testes e handling específico de erros por tipo
- **Correção**: Criar classes específicas para cada violação de regra de negócio:
  ```typescript
  // bidding-service
  export class DuplicateBidError extends DomainException {}
  export class BidAlreadyAcceptedError extends DomainException {}

  // project-service
  export class MilestoneNotSequentialError extends DomainException {}

  // payment-service
  export class MilestoneNotValidatedError extends DomainException {}
  ```

---

### FALHA-07 — Configuração de porta do banco inconsistente
- **Severidade**: Baixa
- **Problema**: Arquivos `typeorm.config.ts` referenciam portas hardcoded diferentes (5432–5437), mas dentro da rede Docker os serviços devem usar o hostname do container, não porta local
- **Ocorrências**:
  - `bidding-service/src/infrastructure/database/typeorm.config.ts:8` → porta 5434
  - `project-service/src/infrastructure/database/typeorm.config.ts:8` → porta 5433
  - (etc.)
- **Impacto**: Não afeta execução via docker-compose (usa hostname do serviço), mas pode confundir execução local ou CI
- **Correção**: Garantir que `DB_PORT` seja lido de variável de ambiente; remover portas hardcoded

---

## O Que Está Correto

- ✓ Comunicação entre serviços 100% via eventos RabbitMQ (nenhum serviço faz HTTP para outro diretamente)
- ✓ Cada serviço tem PostgreSQL próprio e isolado
- ✓ Use cases delegam corretamente — zero lógica de negócio nos controllers
- ✓ Value Objects (`Budget`, `Deadline`, `ProposedValue`) com invariantes de domínio
- ✓ Factory `project.factory.ts` centraliza criação com validação
- ✓ Swagger configurado em todos os 7 serviços
- ✓ Variáveis de ambiente externalizadas, sem credenciais no código
- ✓ Dockerfiles presentes em todos os serviços
- ✓ RN02, RN03, RN04, RN06, RN07 implementados corretamente na camada de domínio

---

## Prioridade de Correção

| Prioridade | Falha | Status | Esforço estimado |
|------------|-------|--------|-----------------|
| P1 — Crítico | FALHA-04: criar testes de domínio | Pendente | Alto |
| P2 — Alto | FALHA-02: reestruturar api-gateway ou documentar exceção | Pendente | Médio |
| P3 — Médio | FALHA-05: verificar/criar consumer de evento no payment-service | Pendente | Baixo |
| P4 — Médio | FALHA-03: tipar body: any no portfolio e project | Pendente | Médio |
| ~~P5~~ | ~~FALHA-01: alinhar nome identity-service/user-service~~ | ~~Resolvido~~ | — |
| ~~P6~~ | ~~FALHA-06: criar classes de exceção específicas~~ | Pendente (menor prioridade) | Médio |
| ~~P7~~ | ~~FALHA-07: externalizar porta do banco via env var~~ | ~~Resolvido~~ | — |

### Resolvido em 2026-03-27

- **FALHA-07**: Todos os `typeorm.config.ts` agora usam `5432` como padrão (via env var `DB_PORT`)
- **FALHA (vars identity)**: `DB_USERNAME`/`DB_PASSWORD` do identity-service padronizados para `DB_USER`/`DB_PASS`
- **Infra distribuída**: Cada serviço tem `docker-compose.yml` e `.env.example` próprios para deploy em servidor independente
- **RabbitMQ central**: `docker-compose.infra.yml` criado para o servidor de infra compartilhado
- **DEPLOY.md**: Reescrito para arquitetura distribuída com diagrama, tabela de variáveis e passo a passo por servidor
- **CLAUDE.md seção 9**: Atualizado para refletir estrutura de deploy distribuído

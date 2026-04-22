# MERAKI - Decisões Arquiteturais de Implementação

> Log de decisões tomadas durante o desenvolvimento. Atualizado a cada serviço.

---

## Decisão 1 — Comunicação API Gateway → Microsserviços

**Data:** 2026-03-19
**Status:** Aprovado

### Contexto
A documentação original (doc 05) previa `ClientProxy` com transporte TCP do NestJS Microservices. Porém, o requisito de **testar cada serviço de forma isolada** (Postman/curl) torna isso impraticável — serviços TCP puro não expõem endpoints HTTP.

### Decisão
**HTTP REST + RabbitMQ híbrido:**
- Cada microsserviço é uma aplicação NestJS **HTTP padrão**, com controllers REST normais
- O API Gateway fará **proxy HTTP** (axios) para os serviços downstream
- **RabbitMQ** continua sendo usado para eventos de integração assíncronos entre serviços (doc 04)

### Consequências
- ✅ Cada serviço pode ser testado standalone com Postman/curl
- ✅ Swagger funciona em cada serviço individualmente
- ✅ Simples de debugar — logs HTTP visíveis diretamente
- ⚠️ API Gateway não usa `@MessagePattern` — usa HTTP proxy

---

## Decisão 2 — Naming: `identity-service` (não `user-service`)

**Data:** 2026-03-19
**Status:** Aprovado

### Contexto
Doc 01 usava `user-service`, doc 03 usava `identity-service` no script bash. Confirmado com o usuário.

### Decisão
Usar `identity-service` — alinha semanticamente com o Bounded Context "Identity & Access Context" (DDD).

---

## Decisão 3 — Ordem de Implementação (Incremental)

**Data:** 2026-03-19
**Status:** Concluído

### Sequência definida
1. ✅ `docker-compose.yml` — infraestrutura (PostgreSQL + RabbitMQ)
2. ✅ `identity-service` — autenticação e gerenciamento de usuários (porta 3001)
3. ✅ `api-gateway` — proxy + JWT guard (porta 3000)
4. ✅ `project-service` — projetos e milestones (porta 3002)
5. ✅ `bidding-service` — propostas (porta 3003)
6. ✅ `delivery-service` — entregas + Kanban (porta 3004)
7. ✅ `payment-service` — pagamentos + escrow (porta 3005)
8. ✅ `portfolio-service` — portfólio + avaliações (porta 3006)

### Critério de conclusão por serviço
Cada serviço é considerado **pronto para a próxima fase** quando:
- [ ] Sobe sem erros com `npm run start:dev`
- [ ] Endpoints testáveis via Swagger (`/api/docs`)
- [ ] Conectado ao banco PostgreSQL (tabelas criadas via TypeORM sync)
- [ ] Publica/consome eventos RabbitMQ

---

## Decisão 4 — Perfis de Usuário no identity-service

**Data:** 2026-03-19

### Contexto
O doc 02 define `SpecialistProfile` e `CompanyProfile` como Value Objects do User. No banco, são tabelas separadas.

### Decisão
- Tabelas: `users`, `specialist_profiles`, `company_profiles`
- O campo `user.specialistId` ou `user.companyId` armazena o UUID do perfil correspondente
- O `UserRepository` gerencia todos os 3 modelos internamente (User é o Aggregate Root)
- Perfil é criado automaticamente no `RegisterUserUseCase` junto com o User

### Regra de negócio adicional (RN implícita)
- Registro com `userType = COMPANY` **exige** `companyName` no body
- Registro com `userType = SPECIALIST` não exige campos de perfil no registro (pode preencher depois)

---

## Decisão 5 — RabbitMQ: falha graceful no startup

**Data:** 2026-03-19

### Decisão
O `RabbitMQConfigService` trata falha de conexão no startup com `try/catch` e log de warning — o serviço **sobe mesmo sem RabbitMQ disponível**. Eventos não são publicados até a conexão ser estabelecida.

Isso permite testar o serviço sem Docker rodando.

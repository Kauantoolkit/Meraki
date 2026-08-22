# Meraki

Plataforma de contratação de freelancers técnicos. Empresas publicam projetos com marcos de entrega, especialistas enviam propostas, o contrato é assinado digitalmente e o pagamento fica retido em custódia até o marco ser aprovado.

Arquitetura de microsserviços com 7 serviços independentes, API Gateway e mensageria assíncrona.

---

## Fluxo principal

```
Empresa cria projeto (com marcos)
    → Especialistas enviam propostas
    → Empresa aceita uma proposta (as demais são rejeitadas automaticamente)
    → Ambas as partes assinam o contrato
    → Projeto entra em execução (quadro Kanban de entregas)
    → Empresa aprova marco
    → Pagamento é liberado da custódia com transferência via Pix
```

---

## Arquitetura

Cada serviço tem banco próprio. Comunicação síncrona por HTTP (com API key interna) e assíncrona por RabbitMQ.

| Serviço | Porta | Responsabilidade |
|---------|-------|------------------|
| API Gateway | 3000 | Roteamento, autenticação JWT, rate limiting, Swagger |
| Identity | 3001 | Autenticação, perfis, competências, verificação de e-mail |
| Project | 3002 | Criação de projetos, marcos, assinatura de contrato |
| Bidding | 3003 | Propostas, seleção, mensagens de negociação |
| Delivery | 3004 | Entrega de marcos, quadro Kanban, histórico |
| Payment | 3005 | Contas de custódia, liberação, transferência via Pix |
| Portfolio | 3006 | Perfis públicos, histórico de trabalhos |
| Messaging | 3007 | Notificações (consumidor de eventos RabbitMQ) |

**Eventos publicados:** `project.created`, `bid.submitted`, `bid.accepted`, `milestone.validated`, `payment.released`

### Organização interna (por serviço)

```
domain/          entidades, enums, value objects, interfaces de repositório
application/     casos de uso, DTOs, ports
infrastructure/  implementações de repositório, RabbitMQ, clientes HTTP
interfaces/      controllers, guards, decorators
```

A lógica de negócio vive nas entidades (`Bid.accept()`, `Payment.release()`, `Project.complete()`); os casos de uso apenas orquestram.

---

## Clientes

**Web** — React 18 + TypeScript + Vite + Tailwind

Jornadas implementadas: assistente de criação de projeto em 4 etapas (com criação de competência e quiz de avaliação inline), envio e avaliação de propostas, assinatura de contrato, quadro Kanban de entregas, painel financeiro e de ganhos, busca de talentos.

**Mobile** — Flutter + Riverpod (MVVM)

Paridade de funcionalidades com a web. Dio para HTTP com interceptors de autenticação, Hive para persistência local de token, GoRouter para navegação declarativa.

---

## Decisões de implementação

**Custódia com taxa da plataforma**
`Payment.release()` calcula o valor do especialista e a taxa da plataforma (padrão 10%, configurável via `PLATFORM_FEE_RATE`). A transferência via Pix é tentada automaticamente; se a chave não estiver cadastrada ou a transferência falhar, o valor cai como saque manual e a falha é registrada.

**Aceite de proposta atômico**
Aceitar uma proposta rejeita todas as outras pendentes do projeto na mesma transação. Evita a condição de corrida de duas propostas serem aceitas em paralelo.

**Assinatura de contrato com trilha de auditoria**
Cada assinatura registra IP e User-Agent do signatário. O projeto só muda para `IN_PROGRESS` quando as duas partes assinam. Assinatura duplicada é bloqueada.

**Uma proposta ativa por especialista por projeto**
Verificação de proposta `PENDING` existente antes de aceitar nova submissão.

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, RabbitMQ, JWT |
| Web | React 18, TypeScript, Vite, Tailwind, Axios, Playwright |
| Mobile | Flutter, Riverpod, Dio, Hive, GoRouter |
| Infra | Docker Compose |

---

## Rodando

```bash
# Sobe serviços, bancos e RabbitMQ
docker-compose up -d

# Cliente web (porta 5173)
cd frontend && npm install && npm run dev

# Cliente mobile
cd mobile && flutter run
```

Documentação da API disponível via Swagger no gateway após subir os serviços.

---

## Status

MVP funcional. Todos os 7 serviços implementados com controllers, casos de uso e repositórios. Autenticação, propostas, contratos, entregas e liberação de pagamento operando ponta a ponta.

**Pendente:** integração real com provedor Pix (hoje em modo placeholder — a lógica de transferência e fallback está pronta, faltam credenciais de produção), sistema de avaliações e painel de moderação.

---

## Equipe

Projeto de conclusão da graduação em ADS, desenvolvido em equipe de 4 pessoas. Liderei a arquitetura e sou autor de ~82% dos commits (150 de 184), incluindo os microsserviços, o frontend React, o app Flutter, o sistema de pagamentos e a infraestrutura.

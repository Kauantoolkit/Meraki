# MERAKI — Problemas Arquiteturais (RESOLVIDOS)

> Todos os itens abaixo foram corrigidos.

---

## BLOCO 1 — Repository Interfaces (DIP) ✅

| Item | Arquivos criados |
|---|---|
| delivery-service | `domain/repositories/i-delivery.repository.ts`, `i-kanban.repository.ts`, `i-history.repository.ts` + implementações em `infrastructure/repositories/` |
| payment-service | `domain/repositories/i-payment.repository.ts`, `i-escrow-account.repository.ts` + implementações |
| portfolio-service | `domain/repositories/i-specialist-profile.repository.ts`, `i-work-history.repository.ts`, `i-certification.repository.ts`, `i-review.repository.ts`, `i-portfolio.repository.ts`, `i-company-profile.repository.ts` + implementações |

## BLOCO 2 — Use Cases ✅

| Item | Arquivos criados |
|---|---|
| payment-service | `application/use-cases/release-payment.use-case.ts`, `get-payments.use-case.ts` |
| portfolio-service | `application/use-cases/create-specialist-profile.use-case.ts`, `add-certification.use-case.ts`, `add-review.use-case.ts`, `get-public-profile.use-case.ts`, `record-work-history.use-case.ts`, `get-company-profile.use-case.ts`, `get-portfolio.use-case.ts` |

## BLOCO 3 — Domain Services ✅

| Item | Arquivo |
|---|---|
| delivery-service | `domain/services/milestone-progression.domain-service.ts` |
| payment-service | `domain/services/fee-calculation.domain-service.ts` |
| bidding-service | `domain/services/bid-selection.domain-service.ts` |

## BLOCO 4 — Value Objects ✅

| Item | Arquivo |
|---|---|
| project-service | `domain/value-objects/budget.value-object.ts`, `deadline.value-object.ts` |
| bidding-service | `domain/value-objects/proposed-value.value-object.ts` |
| portfolio-service | `domain/value-objects/rating.value-object.ts` |

## BLOCO 5 — Factories ✅

| Item | Arquivo |
|---|---|
| bidding-service | `domain/factories/bid.factory.ts` |
| delivery-service | `domain/factories/delivery.factory.ts`, `kanban-column.factory.ts` |
| payment-service | `domain/factories/payment.factory.ts` |
| portfolio-service | `domain/factories/specialist-profile.factory.ts` |

## BLOCO 6 — RF13 (CompanyPublicProfile) ✅

- `domain/entities/company-public-profile.entity.ts`
- `domain/repositories/i-company-profile.repository.ts`
- `infrastructure/repositories/company-profile.repository.ts`
- `application/use-cases/get-company-profile.use-case.ts`
- Endpoint: `GET /api/profiles/company/:companyId`

## BLOCO 7 — Domain Events ✅

| Item | Arquivos |
|---|---|
| delivery-service | `domain/events/base.event.ts`, `delivery-submitted.event.ts`, `milestone-validated.event.ts` |
| payment-service | `domain/events/base.event.ts`, `payment-released.event.ts` |

## BLOCO 8 — Documentação ✅

- `docs/impl/context-mapping.md` — Core/Supporting/Generic + diagrama de fluxo de eventos
- `docs/ubiquitous-language.md` — Glossário completo com termos, status e RNs

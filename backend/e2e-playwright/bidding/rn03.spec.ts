/**
 * Testes de integração — RN03: Seleção de vencedor único por projeto
 *
 * Pré-requisito: backend rodando via docker-compose
 *   cd backend && docker compose up -d
 *
 * Rodar:
 *   cd backend/e2e-playwright && npm test
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import {
  registerAndLogin,
  uniqueProjectId,
  submitBid,
  acceptBid,
  getBid,
  BIDDING_URL,
  RegisteredUser,
} from '../helpers/auth';

// ─── usuários compartilhados pelo suite (criados 1x no beforeAll) ─────────────

let company:  RegisteredUser;
let spec1:    RegisteredUser;
let spec2:    RegisteredUser;
let spec3:    RegisteredUser;

const RUN = Date.now(); // sufixo único por execução — evita conflito de email

// Espera mínima entre chamadas — o endpoint /register tem rate-limit de 5 req/min por IP
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

test.beforeAll(async ({ request }) => {
  company = await registerAndLogin(request, {
    userType: 'COMPANY',
    suffix: `cmp-${RUN}`,
    companyName: 'Meraki E2E Ltda',
  });
  await wait(400);
  spec1 = await registerAndLogin(request, { userType: 'SPECIALIST', suffix: `sp1-${RUN}` });
  await wait(400);
  spec2 = await registerAndLogin(request, { userType: 'SPECIALIST', suffix: `sp2-${RUN}` });
  await wait(400);
  spec3 = await registerAndLogin(request, { userType: 'SPECIALIST', suffix: `sp3-${RUN}` });
});

// ─── helper local ─────────────────────────────────────────────────────────────

async function setupBids(request: APIRequestContext, projectId: string) {
  const bid1 = await submitBid(request, spec1.accessToken, projectId);
  const bid2 = await submitBid(request, spec2.accessToken, projectId);
  return { bid1, bid2 };
}

// ─── testes ───────────────────────────────────────────────────────────────────

test.describe('RN03 — Seleção de Vencedor Único por Projeto', () => {

  test('RN03-01: empresa aceita proposta → 204', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1 } = await setupBids(request, pid);

    const res = await acceptBid(request, company.accessToken, bid1.id);

    expect(res.status()).toBe(204);
  });

  test('RN03-02: proposta aceita fica com status ACCEPTED', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1 } = await setupBids(request, pid);

    await acceptBid(request, company.accessToken, bid1.id);

    const detail = await getBid(request, company.accessToken, bid1.id);
    const body   = await detail.json();

    expect(body.status).toBe('ACCEPTED');
  });

  test('RN03-03: demais propostas PENDING do projeto viram REJECTED', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1, bid2 } = await setupBids(request, pid);

    await acceptBid(request, company.accessToken, bid1.id);

    const loserRes  = await getBid(request, company.accessToken, bid2.id);
    const loserBody = await loserRes.json();

    expect(loserBody.status).toBe('REJECTED');
  });

  test('RN03-04: apenas o vencedor fica ACCEPTED, os demais REJECTED', async ({ request }) => {
    const pid  = uniqueProjectId();
    const bid1 = await submitBid(request, spec1.accessToken, pid);
    const bid2 = await submitBid(request, spec2.accessToken, pid);
    const bid3 = await submitBid(request, spec3.accessToken, pid);

    await acceptBid(request, company.accessToken, bid2.id);

    const r1 = await (await getBid(request, company.accessToken, bid1.id)).json();
    const r2 = await (await getBid(request, company.accessToken, bid2.id)).json();
    const r3 = await (await getBid(request, company.accessToken, bid3.id)).json();

    expect(r1.status).toBe('REJECTED');
    expect(r2.status).toBe('ACCEPTED');
    expect(r3.status).toBe('REJECTED');
  });

  test('RN03-05: segunda aceitação no mesmo projeto retorna 409', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1, bid2 } = await setupBids(request, pid);

    await acceptBid(request, company.accessToken, bid1.id);

    const res  = await acceptBid(request, company.accessToken, bid2.id);
    const body = await res.json();

    expect(res.status()).toBe(409);
    expect(body.message).toMatch(/RN03/);
  });

  test('RN03-06: body do 409 tem estrutura correta', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1, bid2 } = await setupBids(request, pid);

    await acceptBid(request, company.accessToken, bid1.id);
    const res  = await acceptBid(request, company.accessToken, bid2.id);
    const body = await res.json();

    expect(body).toMatchObject({
      statusCode: 409,
      message:   expect.stringContaining('RN03'),
      timestamp: expect.any(String),
      path:      expect.any(String),
    });
  });

  test('RN03-07: especialista não pode aceitar a própria proposta → 403', async ({ request }) => {
    const pid  = uniqueProjectId();
    const bid1 = await submitBid(request, spec1.accessToken, pid);

    const res  = await acceptBid(request, spec1.accessToken, bid1.id);
    const body = await res.json();

    expect(res.status()).toBe(403);
    expect(body.message).toMatch(/própria proposta/i);
  });

  test('RN03-08: proposta inexistente retorna 404', async ({ request }) => {
    const res = await acceptBid(request, company.accessToken, '00000000-0000-0000-0000-000000000000');

    expect(res.status()).toBe(404);
  });

  test('RN03-09: proposta já REJECTED não pode ser aceita → 400', async ({ request }) => {
    const pid = uniqueProjectId();
    const { bid1, bid2 } = await setupBids(request, pid);

    // aceita bid1 → bid2 vira REJECTED automaticamente
    await acceptBid(request, company.accessToken, bid1.id);

    // tenta aceitar bid2 que já está REJECTED
    const res = await acceptBid(request, company.accessToken, bid2.id);

    // bid2 está REJECTED → 409 (projeto já tem vencedor) ou 400 (bid não está PENDING)
    // ambos são respostas válidas de erro
    expect([400, 409]).toContain(res.status());
  });

  test('RN03-10: sem autenticação retorna 401', async ({ request }) => {
    const pid  = uniqueProjectId();
    const bid1 = await submitBid(request, spec1.accessToken, pid);

    const res = await request.put(`${BIDDING_URL}/api/bids/${bid1.id}/accept`);

    expect(res.status()).toBe(401);
  });

  test('RN03-11: ciclo completo — submissão, seleção e bloqueio de segunda aceitação', async ({ request }) => {
    const pid = uniqueProjectId();

    // 1. dois especialistas submetem propostas
    const bidA = await submitBid(request, spec1.accessToken, pid, { budget: 4000 });
    const bidB = await submitBid(request, spec2.accessToken, pid, { budget: 7000 });

    expect(bidA.status).toBe('PENDING');
    expect(bidB.status).toBe('PENDING');

    // 2. empresa aceita bidA
    const accept = await acceptBid(request, company.accessToken, bidA.id);
    expect(accept.status()).toBe(204);

    // 3. verifica estados
    const winnerBody = await (await getBid(request, company.accessToken, bidA.id)).json();
    const loserBody  = await (await getBid(request, company.accessToken, bidB.id)).json();

    expect(winnerBody.status).toBe('ACCEPTED');
    expect(loserBody.status).toBe('REJECTED');

    // 4. tenta aceitar bidB → 409
    const secondAccept = await acceptBid(request, company.accessToken, bidB.id);
    expect(secondAccept.status()).toBe(409);
  });
});

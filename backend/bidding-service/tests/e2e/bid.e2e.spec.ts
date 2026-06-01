import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { createTestApp, InMemoryBidStore, companyToken, specialistToken } from './test-app';
import { Bid } from '../../src/domain/entities/bid.entity';
import { BidStatus } from '../../src/domain/enums/bid-status.enum';

// ─── helpers ─────────────────────────────────────────────────────────────────

function seedBid(store: InMemoryBidStore, overrides: Partial<Bid> = {}): Bid {
  const bid = Object.assign(new Bid(), {
    id: uuidv4(),
    projectId: 'project-1',
    specialistId: 'spec-1',
    proposal: 'Proposta de teste suficientemente longa',
    proposedBudget: 5000,
    estimatedDuration: 30,
    status: BidStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    ...overrides,
  });
  store.bids.push(bid);
  return bid;
}

// ─── suite ───────────────────────────────────────────────────────────────────

describe('Bid E2E — PUT /api/bids/:id/accept (RN03)', () => {
  let app: INestApplication;
  let store: InMemoryBidStore;
  let jwt: JwtService;

  beforeEach(async () => {
    const bundle = await createTestApp();
    app = bundle.app;
    store = bundle.store;
    jwt = bundle.jwtService;
  });

  afterEach(async () => {
    await app.close();
  });

  // ── cenário positivo ───────────────────────────────────────────────────────

  it('RN03-01: empresa aceita proposta → 204 e status ACCEPTED', async () => {
    const bid = seedBid(store, { specialistId: 'spec-1' });
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);

    const updated = store.bids.find((b) => b.id === bid.id);
    expect(updated?.status).toBe(BidStatus.ACCEPTED);
  });

  it('RN03-02: ao aceitar uma proposta, todas as demais PENDING do projeto viram REJECTED', async () => {
    const winner = seedBid(store, { id: 'bid-winner', specialistId: 'spec-1' });
    const loser1 = seedBid(store, { id: 'bid-loser-1', specialistId: 'spec-2' });
    const loser2 = seedBid(store, { id: 'bid-loser-2', specialistId: 'spec-3' });
    const token = companyToken(jwt);

    await request(app.getHttpServer())
      .put(`/api/bids/${winner.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(store.bids.find((b) => b.id === winner.id)?.status).toBe(BidStatus.ACCEPTED);
    expect(store.bids.find((b) => b.id === loser1.id)?.status).toBe(BidStatus.REJECTED);
    expect(store.bids.find((b) => b.id === loser2.id)?.status).toBe(BidStatus.REJECTED);
  });

  it('RN03-03: bids WITHDRAWN não são alteradas pela seleção do vencedor', async () => {
    const winner = seedBid(store, { id: 'bid-winner', specialistId: 'spec-1' });
    const withdrawn = seedBid(store, {
      id: 'bid-withdrawn',
      specialistId: 'spec-2',
      status: BidStatus.WITHDRAWN,
    });
    const token = companyToken(jwt);

    await request(app.getHttpServer())
      .put(`/api/bids/${winner.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(store.bids.find((b) => b.id === withdrawn.id)?.status).toBe(BidStatus.WITHDRAWN);
  });

  // ── unicidade — RN03 ──────────────────────────────────────────────────────

  it('RN03-04: segunda tentativa de aceitação no mesmo projeto retorna 409', async () => {
    const first = seedBid(store, { id: 'bid-first', specialistId: 'spec-1' });
    const second = seedBid(store, { id: 'bid-second', specialistId: 'spec-2' });
    const token = companyToken(jwt);

    await request(app.getHttpServer())
      .put(`/api/bids/${first.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${second.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/RN03/);
  });

  it('RN03-05: não é possível aceitar a própria proposta já vencedora (retorna 409)', async () => {
    const bid = seedBid(store, { id: 'bid-1', status: BidStatus.ACCEPTED, specialistId: 'spec-1' });
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  // ── autorização ───────────────────────────────────────────────────────────

  it('RN03-06: especialista não pode aceitar a própria proposta → 403', async () => {
    const bid = seedBid(store, { specialistId: 'spec-1' });
    const token = specialistToken(jwt, 'spec-1');

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/própria proposta/i);
  });

  it('RN03-07: especialista diferente pode aceitar proposta de outro especialista', async () => {
    const bid = seedBid(store, { specialistId: 'spec-1' });
    const token = specialistToken(jwt, 'spec-outro');

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  // ── erros 4xx ─────────────────────────────────────────────────────────────

  it('RN03-08: proposta inexistente retorna 404', async () => {
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${uuidv4()}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('RN03-09: proposta já REJECTED não pode ser aceita → 400', async () => {
    const bid = seedBid(store, { status: BidStatus.REJECTED });
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('RN03-10: proposta já WITHDRAWN não pode ser aceita → 400', async () => {
    const bid = seedBid(store, { status: BidStatus.WITHDRAWN });
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('RN03-11: requisição sem token retorna 401', async () => {
    const bid = seedBid(store);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${bid.id}/accept`);

    expect(res.status).toBe(401);
  });

  // ── integridade da resposta de erro ───────────────────────────────────────

  it('RN03-12: resposta de erro 409 tem estrutura correta', async () => {
    seedBid(store, { id: 'bid-first', specialistId: 'spec-1', status: BidStatus.ACCEPTED });
    const second = seedBid(store, { id: 'bid-second', specialistId: 'spec-2' });
    const token = companyToken(jwt);

    const res = await request(app.getHttpServer())
      .put(`/api/bids/${second.id}/accept`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('RN03'),
      timestamp: expect.any(String),
      path: expect.any(String),
    });
  });
});

describe('Bid E2E — Fluxo completo de submissão e seleção', () => {
  let app: INestApplication;
  let store: InMemoryBidStore;
  let jwt: JwtService;

  beforeEach(async () => {
    const bundle = await createTestApp();
    app = bundle.app;
    store = bundle.store;
    jwt = bundle.jwtService;
  });

  afterEach(async () => {
    await app.close();
  });

  it('submete propostas e seleciona vencedor — ciclo completo', async () => {
    const companyTk = companyToken(jwt, 'comp-1');
    const spec1Tk = specialistToken(jwt, 'spec-1');
    const spec2Tk = specialistToken(jwt, 'spec-2');
    const projectId = uuidv4();

    // 1. especialista 1 submete proposta
    const sub1 = await request(app.getHttpServer())
      .post('/api/bids')
      .set('Authorization', `Bearer ${spec1Tk}`)
      .send({
        projectId,
        proposal: 'Proposta do especialista 1 — mais de dez caracteres',
        proposedBudget: 5000,
        estimatedDuration: 30,
      });
    expect(sub1.status).toBe(201);
    const bid1Id = sub1.body.id;

    // 2. especialista 2 submete proposta
    const sub2 = await request(app.getHttpServer())
      .post('/api/bids')
      .set('Authorization', `Bearer ${spec2Tk}`)
      .send({
        projectId,
        proposal: 'Proposta do especialista 2 — mais de dez caracteres',
        proposedBudget: 6000,
        estimatedDuration: 45,
      });
    expect(sub2.status).toBe(201);
    const bid2Id = sub2.body.id;

    // 3. empresa aceita proposta do especialista 1
    const accept = await request(app.getHttpServer())
      .put(`/api/bids/${bid1Id}/accept`)
      .set('Authorization', `Bearer ${companyTk}`);
    expect(accept.status).toBe(204);

    // 4. verifica estados finais
    expect(store.bids.find((b) => b.id === bid1Id)?.status).toBe(BidStatus.ACCEPTED);
    expect(store.bids.find((b) => b.id === bid2Id)?.status).toBe(BidStatus.REJECTED);

    // 5. tentativa de aceitar segunda proposta → 409
    const second = await request(app.getHttpServer())
      .put(`/api/bids/${bid2Id}/accept`)
      .set('Authorization', `Bearer ${companyTk}`);
    expect(second.status).toBe(409);
  });
});

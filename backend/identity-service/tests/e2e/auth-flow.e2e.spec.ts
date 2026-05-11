import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, InMemoryStore } from './test-app';
import { UserType } from '../../src/domain/enums/user-type.enum';

describe('Auth Flow (e2e — register → login → /me → refresh → logout → delete)', () => {
  let app: INestApplication;
  let store: InMemoryStore;

  beforeEach(async () => {
    const bundle = await createTestApp();
    app = bundle.app;
    store = bundle.store;
  });

  afterEach(async () => {
    await app.close();
  });

  it('TEST-02: ciclo completo de autenticação', async () => {
    // 1. register
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'flow@meraki.com',
        password: 'Senha123',
        name: 'Flow User',
        userType: UserType.SPECIALIST,
      });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.userType).toBe(UserType.SPECIALIST);
    expect(registerRes.body.specialistId).toBeDefined();
    expect(store.users).toHaveLength(1);

    // 2. login
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'flow@meraki.com', password: 'Senha123' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(loginRes.body.refreshToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    const { accessToken, refreshToken } = loginRes.body;

    // 3. GET /me
    const meRes = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('flow@meraki.com');

    // 4. refresh
    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken);
    const newRefresh = refreshRes.body.refreshToken;

    // 5. logout
    const logoutRes = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: newRefresh });
    expect(logoutRes.status).toBe(204);

    // 6. refresh com token revogado → 401
    const reuseRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: newRefresh });
    expect(reuseRes.status).toBe(401);
  });

  it('CRUD-01: DELETE /users/me faz soft-delete e bloqueia re-login', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'delete@meraki.com',
        password: 'Senha123',
        name: 'Delete User',
        userType: UserType.SPECIALIST,
      });
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'delete@meraki.com', password: 'Senha123' });
    const { accessToken } = login.body;

    const del = await request(app.getHttpServer())
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(del.status).toBe(204);

    // re-login deve falhar (soft-deleted é ignorado em findByEmail)
    const relogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'delete@meraki.com', password: 'Senha123' });
    expect(relogin.status).toBe(401);
  });

  it('rejeita reuso do refresh-token original após rotation (revoga família)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'reuse@meraki.com',
        password: 'Senha123',
        name: 'Reuse',
        userType: UserType.SPECIALIST,
      });
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'reuse@meraki.com', password: 'Senha123' });
    const original = login.body.refreshToken;

    const rotated = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: original });
    expect(rotated.status).toBe(200);

    // reuso do original (já rotacionado) → 401 e revoga a família
    const reuse = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: original });
    expect(reuse.status).toBe(401);

    // E o refresh emitido pela rotação também não deve mais funcionar
    const cascade = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: rotated.body.refreshToken });
    expect(cascade.status).toBe(401);
  });
});

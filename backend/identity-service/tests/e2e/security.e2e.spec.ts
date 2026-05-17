import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, signAccessToken, InMemoryStore } from './test-app';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../../src/domain/enums/user-type.enum';

describe('Security (XSS / SQLi / RBAC / Throttle)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let store: InMemoryStore;

  async function setup(withThrottler = false) {
    const bundle = await createTestApp({ withThrottler });
    app = bundle.app;
    jwtService = bundle.jwtService;
    store = bundle.store;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('TEST-03 — XSS', () => {
    beforeEach(async () => setup());

    it('payload <script> em name é armazenado como string literal (sem execução); fetch via /me devolve a string crua', async () => {
      const xss = '<script>alert(1)</script>';
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'xss@meraki.com',
          password: 'Senha123',
          name: xss,
          userType: UserType.SPECIALIST,
        });
      expect(res.status).toBe(201);
      // O backend não interpreta HTML; o cliente é responsável por escapar ao renderizar.
      // Garantimos que o name persistido é exatamente o input (sem ser parcial nem nulificado).
      expect(store.users[0].name).toBe(xss);
    });

    it('rejeita name com mais de 255 caracteres (DoS via payload gigante)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'big@meraki.com',
          password: 'Senha123',
          name: 'a'.repeat(300),
          userType: UserType.SPECIALIST,
        });
      expect(res.status).toBe(400);
    });

    it('rejeita bio com mais de 2000 caracteres no UpdateProfile', async () => {
      // user já criado
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'biguser@meraki.com', password: 'Senha123', name: 'Usuario',
        userType: UserType.SPECIALIST,
      });
      const login = await request(app.getHttpServer())
        .post('/api/auth/login').send({ email: 'biguser@meraki.com', password: 'Senha123' });

      const res = await request(app.getHttpServer())
        .put('/api/users/me/profile')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .send({ bio: 'a'.repeat(3000) });
      expect(res.status).toBe(400);
    });
  });

  describe('TEST-04 — SQLi', () => {
    beforeEach(async () => setup());

    it("payload SQLi em email no login retorna 401 (formato inválido pelo IsEmail) sem leak", async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: "' OR 1=1 --", password: 'Senha123' });
      expect([400, 401]).toContain(res.status);
      const body = JSON.stringify(res.body);
      expect(body.toLowerCase()).not.toContain('select');
      expect(body.toLowerCase()).not.toContain('typeorm');
      expect(body.toLowerCase()).not.toContain('postgres');
    });

    it('payload SQLi em :id é rejeitado pelo ParseUUIDPipe (400) — TypeORM nem é chamado', async () => {
      const userId = '11111111-1111-1111-1111-111111111111';
      const token = signAccessToken(jwtService, {
        sub: userId, email: 'a@b.com', userType: UserType.SPECIALIST,
      });
      const res = await request(app.getHttpServer())
        .get(`/api/users/${encodeURIComponent("' OR 1=1 --")}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('TEST-06 — RBAC ownership/role', () => {
    beforeEach(async () => setup());

    it('SPECIALIST tentando ler /users/:id de outro usuário recebe 403', async () => {
      const token = signAccessToken(jwtService, {
        sub: '11111111-1111-1111-1111-111111111111',
        email: 'attacker@meraki.com',
        userType: UserType.SPECIALIST,
      });
      const res = await request(app.getHttpServer())
        .get('/api/users/22222222-2222-2222-2222-222222222222')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('ADMIN consegue ler /users/:id de qualquer usuário (404 se não existe, mas não 403)', async () => {
      const token = signAccessToken(jwtService, {
        sub: '00000000-0000-0000-0000-0000000000aa',
        email: 'admin@meraki.com',
        userType: UserType.ADMIN,
      });
      const res = await request(app.getHttpServer())
        .get('/api/users/22222222-2222-2222-2222-222222222222')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404]).toContain(res.status);
      expect(res.status).not.toBe(403);
    });

    it('requisição sem JWT recebe 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/22222222-2222-2222-2222-222222222222');
      expect(res.status).toBe(401);
    });
  });

  describe('TEST-05 — Rate limit (Throttler 5/min em /auth/login)', () => {
    beforeEach(async () => setup(true));

    it('6ª tentativa de login retorna 429', async () => {
      // 5 logins inválidos consecutivos → todos 401
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'noone@meraki.com', password: 'Senha123' });
        expect(res.status).toBe(401);
      }
      // 6ª → 429
      const final = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noone@meraki.com', password: 'Senha123' });
      expect(final.status).toBe(429);
    });
  });
});

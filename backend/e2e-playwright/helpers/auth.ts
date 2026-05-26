import { APIRequestContext } from '@playwright/test';
import { randomUUID } from 'crypto';

export const IDENTITY_URL = process.env.IDENTITY_URL ?? 'http://localhost:3001';
export const BIDDING_URL  = process.env.BIDDING_URL  ?? 'http://localhost:3003';

export type UserType = 'SPECIALIST' | 'COMPANY';

export interface RegisteredUser {
  email: string;
  password: string;
  accessToken: string;
  specialistId?: string;
  companyId?: string;
}

/**
 * Registra um usuário e faz login, retornando o accessToken.
 * Usa um sufixo aleatório no email para garantir unicidade por test run.
 */
export async function registerAndLogin(
  request: APIRequestContext,
  opts: {
    userType: UserType;
    suffix: string;
    companyName?: string;
  },
): Promise<RegisteredUser> {
  const email    = `test-${opts.suffix}@meraki-e2e.com`;
  const password = 'Senha123!';

  // Registro
  const regRes = await request.post(`${IDENTITY_URL}/api/auth/register`, {
    data: {
      email,
      password,
      name: `Test User ${opts.suffix}`,
      userType: opts.userType,
      ...(opts.companyName ? { companyName: opts.companyName } : {}),
    },
  });

  if (!regRes.ok()) {
    const body = await regRes.json();
    throw new Error(`Register falhou (${regRes.status()}): ${JSON.stringify(body)}`);
  }

  // Login
  const loginRes = await request.post(`${IDENTITY_URL}/api/auth/login`, {
    data: { email, password },
  });

  if (!loginRes.ok()) {
    const body = await loginRes.json();
    throw new Error(`Login falhou (${loginRes.status()}): ${JSON.stringify(body)}`);
  }

  const loginBody = await loginRes.json();
  return {
    email,
    password,
    accessToken: loginBody.accessToken,
    specialistId: loginBody.specialistId,
    companyId: loginBody.companyId,
  };
}

/** Cria um projectId UUID v4 único — o bidding-service valida formato UUID. */
export function uniqueProjectId(): string {
  return randomUUID();
}

/** Submete uma proposta e retorna o body da resposta (com .id). */
export async function submitBid(
  request: APIRequestContext,
  token: string,
  projectId: string,
  opts: { budget?: number; duration?: number } = {},
): Promise<{ id: string; status: string }> {
  const res = await request.post(`${BIDDING_URL}/api/bids`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      projectId,
      proposal: 'Proposta de teste via Playwright — mais de 10 chars',
      proposedBudget: opts.budget ?? 5000,
      estimatedDuration: opts.duration ?? 30,
    },
  });

  if (!res.ok()) {
    const body = await res.json();
    throw new Error(`submitBid falhou (${res.status()}): ${JSON.stringify(body)}`);
  }

  return res.json();
}

/** Aceita uma proposta. Retorna o objeto de resposta do Playwright. */
export async function acceptBid(
  request: APIRequestContext,
  token: string,
  bidId: string,
) {
  return request.put(`${BIDDING_URL}/api/bids/${bidId}/accept`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Busca uma proposta pelo id. */
export async function getBid(
  request: APIRequestContext,
  token: string,
  bidId: string,
) {
  return request.get(`${BIDDING_URL}/api/bids/${bidId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

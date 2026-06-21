import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL as string;

@Injectable()
export class AuthService {
  constructor(private readonly proxy: HttpProxyService) {}

  register(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/register`, dto);
  }

  login(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/login`, dto);
  }

  refresh(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/refresh`, dto);
  }

  logout(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/logout`, dto);
  }

  verifyEmail(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/verify-email`, dto);
  }

  forgotPassword(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/forgot-password`, dto);
  }

  resetPassword(dto: Record<string, any>) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/reset-password`, dto);
  }
}

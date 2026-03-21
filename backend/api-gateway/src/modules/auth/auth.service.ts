import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

@Injectable()
export class AuthService {
  constructor(private readonly proxy: HttpProxyService) {}

  register(dto: any) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/register`, dto);
  }

  login(dto: any) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/login`, dto);
  }
}

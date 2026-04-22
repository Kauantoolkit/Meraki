import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL as string;

@Injectable()
export class AuthService {
  constructor(private readonly proxy: HttpProxyService) {}

  register(dto: RegisterDto) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/register`, dto);
  }

  login(dto: LoginDto) {
    return this.proxy.post(`${IDENTITY_URL}/api/auth/login`, dto);
  }
}

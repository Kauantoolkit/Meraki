import { Injectable } from '@nestjs/common';
import { HttpProxyService } from '../../proxy/http-proxy.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

@Injectable()
export class UsersService {
  constructor(private readonly proxy: HttpProxyService) {}

  getMe(token: string) {
    return this.proxy.get(`${IDENTITY_URL}/api/users/me`, this.proxy.authHeaders(token));
  }

  getById(id: string, token: string) {
    return this.proxy.get(`${IDENTITY_URL}/api/users/${id}`, this.proxy.authHeaders(token));
  }

  updateProfile(dto: UpdateProfileDto, token: string) {
    return this.proxy.put(`${IDENTITY_URL}/api/users/me/profile`, dto, this.proxy.authHeaders(token));
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdentityClientService {
  private readonly logger = new Logger(IdentityClientService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.get<string>('IDENTITY_SERVICE_URL', 'http://identity-service:3001');
    this.apiKey = config.get<string>('INTERNAL_API_KEY', '');
  }

  async getSpecialistPixKey(specialistId: string): Promise<string | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/internal/users/specialist/${specialistId}/pix-key`,
        { headers: { 'x-api-key': this.apiKey } },
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.pixKey ?? null;
    } catch (err) {
      this.logger.warn(`Não foi possível buscar pixKey do especialista ${specialistId}: ${err.message}`);
      return null;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class IdentityLookupService {
  private readonly logger = new Logger(IdentityLookupService.name);
  private readonly identityUrl = process.env.IDENTITY_SERVICE_URL ?? 'http://identity-service:3001';
  private readonly apiKey = process.env.INTERNAL_API_KEY ?? 'meraki-internal-key';

  /**
   * Recebe uma lista de specialistIds e retorna um mapa specialistId → nome.
   */
  async resolveSpecialistNames(specialistIds: string[]): Promise<Record<string, string>> {
    const unique = [...new Set(specialistIds.filter(Boolean))];
    if (unique.length === 0) return {};

    const names: Record<string, string> = {};
    await Promise.all(
      unique.map(async (sId) => {
        try {
          const res = await fetch(
            `${this.identityUrl}/internal/users/by-specialist/${sId}`,
            { headers: { 'x-api-key': this.apiKey } },
          );
          if (res.ok) {
            const data = await res.json();
            names[sId] = data.name;
          }
        } catch (err) {
          this.logger.warn(`Falha ao resolver nome do especialista ${sId}: ${err}`);
        }
      }),
    );
    return names;
  }
}

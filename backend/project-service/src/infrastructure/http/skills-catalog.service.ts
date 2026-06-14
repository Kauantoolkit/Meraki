import { Injectable, Logger } from '@nestjs/common';
import { ISkillCatalogPort } from '../../application/ports/skill-catalog.port';

@Injectable()
export class SkillsCatalogService implements ISkillCatalogPort {
  private readonly logger = new Logger(SkillsCatalogService.name);
  private readonly identityUrl = process.env.IDENTITY_SERVICE_URL ?? 'http://identity-service:3001';

  async validateSkills(skillNames: string[]): Promise<string[]> {
    try {
      const res = await fetch(`${this.identityUrl}/api/skills`);
      if (!res.ok) return [];
      const skills: { name: string; displayName: string }[] = await res.json();
      const catalogNames = new Set([
        ...skills.map((s) => s.name),
        ...skills.map((s) => s.displayName.toLowerCase()),
      ]);
      return skillNames.filter((s) => !catalogNames.has(s.trim().toLowerCase()));
    } catch (err) {
      this.logger.warn(`Não foi possível validar skills no catálogo: ${err}`);
      return []; // falha silenciosa
    }
  }
}

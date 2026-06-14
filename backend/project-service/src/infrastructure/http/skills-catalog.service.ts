import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SkillsCatalogService {
  private readonly logger = new Logger(SkillsCatalogService.name);
  private readonly identityUrl = process.env.IDENTITY_SERVICE_URL ?? 'http://identity-service:3001';

  async skillExists(skillName: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.identityUrl}/api/skills`);
      if (!res.ok) return true; // falha silenciosa: não bloqueia se identity-service indisponível
      const skills: { name: string; displayName: string }[] = await res.json();
      const normalized = skillName.trim().toLowerCase();
      return skills.some((s) => s.name === normalized || s.displayName.toLowerCase() === normalized);
    } catch (err) {
      this.logger.warn(`Não foi possível validar skill "${skillName}" no catálogo: ${err}`);
      return true; // falha silenciosa
    }
  }

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

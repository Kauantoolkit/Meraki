export const SKILL_CATALOG_PORT = 'SKILL_CATALOG_PORT';

export interface ISkillCatalogPort {
  /** Retorna os nomes das skills que NÃO existem no catálogo canônico. */
  validateSkills(skillNames: string[]): Promise<string[]>;
}

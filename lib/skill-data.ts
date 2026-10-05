import type { ContentRecord, SkillCatalogPayload } from './content-model';
import skillJson from '@/content/skills/pr-selftest-orchestrator.json';

export const featuredSkill = skillJson as ContentRecord<SkillCatalogPayload>;

export const skillCatalog = [featuredSkill];

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

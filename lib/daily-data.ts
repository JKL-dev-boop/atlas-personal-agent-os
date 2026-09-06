import type { ContentRecord, DailyBriefPayload } from './content-model';
import dailyBriefJson from '@/content/daily/2026-09-06.json';

export const dailyBrief = dailyBriefJson as ContentRecord<DailyBriefPayload>;

export const featuredProjects = dailyBrief.payload.featured
  .map((repository) => dailyBrief.payload.projects.find((project) => project.repository === repository))
  .filter((project): project is DailyBriefPayload['projects'][number] => Boolean(project));

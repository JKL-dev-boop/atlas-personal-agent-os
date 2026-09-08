import type { ContentRecord, DailyBriefPayload } from './content-model';
import dailyBriefJson from '@/content/daily/2026-09-08.json';

export const dailyBrief = dailyBriefJson as ContentRecord<DailyBriefPayload>;

const editionInstant = new Date(`${dailyBrief.payload.editionDate}T00:00:00+08:00`);
const completedInstant = new Date(dailyBrief.payload.collection.completedAt ?? dailyBrief.updatedAt);

export const dailyDisplay = {
  editionDate: new Intl.DateTimeFormat('zh-CN', {
    timeZone: dailyBrief.payload.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(editionInstant),
  editionDateWithWeekday: new Intl.DateTimeFormat('zh-CN', {
    timeZone: dailyBrief.payload.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(editionInstant),
  completedTime: new Intl.DateTimeFormat('zh-CN', {
    timeZone: dailyBrief.payload.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(completedInstant),
  dailyCount: dailyBrief.payload.projects.filter((project) => project.trending?.period === 'daily').length,
  weeklyCount: dailyBrief.payload.projects.filter((project) => project.trending?.period === 'weekly').length,
  trustedDailyDeltaCount: dailyBrief.payload.projects.filter((project) => project.dailyStars !== null).length,
};

export const featuredProjects = dailyBrief.payload.featured
  .map((repository) => dailyBrief.payload.projects.find((project) => project.repository === repository))
  .filter((project): project is DailyBriefPayload['projects'][number] => Boolean(project));

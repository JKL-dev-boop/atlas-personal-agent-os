import weeklyJson from '@/content/weekly/2026-10-05.json';

import type { ContentRecord, WeeklyCategory, WeeklyDigestPayload } from './content-model';

export const weeklyDigest = weeklyJson as ContentRecord<WeeklyDigestPayload>;

export const weeklyCategoryLabels: Record<WeeklyCategory, string> = {
  'ai-agent': 'AI / Agent',
  applications: '应用产品',
  'developer-tools': '开发工具',
  'libraries-frameworks': '库与框架',
  'data-compute': '数据与计算',
  'cloud-platform': '云与平台工程',
  'containers-sandbox': '容器与 Sandbox',
  'security-privacy': '安全与隐私',
  'systems-hardware': '系统与硬件',
  'learning-resources': '学习资源',
};

export const weeklyProjectsByCategory = new Map(
  weeklyDigest.payload.categoryOrder.map((category) => [
    category,
    weeklyDigest.payload.projects.filter((project) => project.primaryCategory === category),
  ]),
);

export const weeklyFeaturedProjects = weeklyDigest.payload.featured
  .map((repository) => weeklyDigest.payload.projects.find((project) => project.repository === repository))
  .filter((project) => project !== undefined);

export const weeklyDisplay = {
  snapshotDate: new Intl.DateTimeFormat('zh-CN', {
    timeZone: weeklyDigest.payload.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${weeklyDigest.payload.snapshotDate}T00:00:00+08:00`)),
  capturedTime: new Intl.DateTimeFormat('zh-CN', {
    timeZone: weeklyDigest.payload.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(weeklyDigest.payload.capturedAt)),
  activeCategoryCount: [...weeklyProjectsByCategory.values()].filter((projects) => projects.length > 0).length,
};

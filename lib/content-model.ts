export type ModuleId =
  | 'dashboard'
  | 'daily'
  | 'projects'
  | 'presentations'
  | 'knowledge'
  | 'automations'
  | 'sandboxes';

export type ContentStatus = 'draft' | 'published' | 'archived';
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'stale';

export interface ContentRecord<TPayload = unknown> {
  id: string;
  module: ModuleId;
  title: string;
  slug: string;
  summary: string;
  status: ContentStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  payload: TPayload;
}

export interface GitHubProjectSnapshot {
  repository: string;
  url: string;
  description: string;
  category: 'ai-agent' | 'application' | 'sandbox-infra';
  stack: string[];
  totalStars: number | null;
  dailyStars: number | null;
  trending?: {
    period: 'daily' | 'weekly';
    stars: number;
  };
  heatEvidence: string;
  release?: string;
  change?: string;
  relevance: string;
  maturity: string;
  recommendation: '值得试跑' | '值得读源码' | '简单了解';
  sources: string[];
}

export interface DailyBriefPayload {
  editionDate: string;
  timezone: 'Asia/Shanghai';
  featured: string[];
  projects: GitHubProjectSnapshot[];
  collection: {
    startedAt: string;
    completedAt?: string;
    status: RunStatus;
    sourceDate: string;
    notes?: string[];
    error?: string;
  };
}

export interface PresentationPayload {
  file: string;
  cover?: string;
  pageCount?: number;
  version: string;
  visibility: 'public' | 'private';
  sourceFile?: string;
}

export interface AutomationRun {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
  status: RunStatus;
  lastRunAt?: string;
  nextRunAt?: string;
  outputRecordIds: string[];
}

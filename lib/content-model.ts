export type ModuleId =
  | 'dashboard'
  | 'daily'
  | 'weekly'
  | 'projects'
  | 'skills'
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

export type WeeklyCategory =
  | 'ai-agent'
  | 'applications'
  | 'developer-tools'
  | 'libraries-frameworks'
  | 'data-compute'
  | 'cloud-platform'
  | 'containers-sandbox'
  | 'security-privacy'
  | 'systems-hardware'
  | 'learning-resources';

export interface WeeklyProjectSnapshot {
  repository: string;
  url: string;
  description: string;
  primaryCategory: WeeklyCategory;
  tags: string[];
  language: string | null;
  stack: string[];
  totalStars: number;
  weeklyStars: number;
  rank: number;
  heatEvidence: string;
  sourceUrl: string;
  sources: string[];
}

export interface WeeklyDigestPayload {
  snapshotDate: string;
  timezone: 'Asia/Shanghai';
  capturedAt: string;
  taxonomyVersion: number;
  categoryOrder: WeeklyCategory[];
  source: {
    name: 'GitHub Trending';
    period: 'weekly';
    url: string;
    status: 'complete' | 'partial' | 'failed';
    observedCount: number;
  };
  featured: string[];
  projects: WeeklyProjectSnapshot[];
  notes?: string[];
}

export type SkillVerification = 'unverified' | 'metadata-verified' | 'package-validated' | 'install-tested';

export interface SkillCatalogPayload {
  slug: string;
  displayName: string;
  kind: 'agent-skill';
  lifecycle: 'alpha' | 'beta' | 'stable' | 'deprecated';
  verification: SkillVerification;
  visibility: 'public';
  version: {
    label: string;
    releasedAt: string;
    sourceRef: string;
  };
  compatibility: Array<{
    agent: string;
    support: 'supported' | 'partial' | 'experimental';
    lastVerifiedAt: string;
    notes: string;
  }>;
  workflow: string[];
  structure: Array<{
    path: string;
    role: string;
  }>;
  capabilities: Array<{
    name: string;
    description: string;
  }>;
  permissions: Array<{
    surface: string;
    level: 'none' | 'read' | 'write' | 'controlled';
    detail: string;
  }>;
  links: Array<{
    type: 'source' | 'manifest' | 'docs' | 'download' | 'download-mirror' | 'package-manifest' | 'official-docs';
    label: string;
    href: string;
  }>;
  download: {
    href: string;
    mirrorHref: string;
    manifestHref: string;
    fileName: string;
    sha256: string;
    sizeBytes: number;
    entryCount: number;
  };
  license: {
    status: 'not-open-source';
    summary: string;
  };
  installPrompt: string;
  limitations: string[];
  safetyNotes: string[];
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

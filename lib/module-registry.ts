import type { ModuleId } from './content-model';

export interface AtlasModule {
  id: ModuleId;
  name: string;
  description: string;
  href: string;
  version: number;
  enabled: boolean;
  capabilities: string[];
}

export const moduleRegistry: AtlasModule[] = [
  {
    id: 'dashboard',
    name: '总览',
    description: '跨模块信息、快捷入口与系统状态。',
    href: '/',
    version: 1,
    enabled: true,
    capabilities: ['overview', 'status'],
  },
  {
    id: 'daily',
    name: '情报日报',
    description: 'GitHub 项目采集、筛选、解读与历史归档。',
    href: '/daily',
    version: 1,
    enabled: true,
    capabilities: ['collect', 'rank', 'publish', 'archive'],
  },
  {
    id: 'weekly',
    name: '周度全景',
    description: 'GitHub Trending 周榜全量分类与跨领域发现。',
    href: '/weekly',
    version: 1,
    enabled: true,
    capabilities: ['collect', 'classify', 'compare', 'archive'],
  },
  {
    id: 'projects',
    name: '项目雷达',
    description: '长期追踪项目热度、Release 与重要变化。',
    href: '/projects',
    version: 1,
    enabled: true,
    capabilities: ['track', 'compare', 'snapshot'],
  },
  {
    id: 'skills',
    name: 'Skill 库',
    description: '可追溯的 Agent Skill、版本、权限、安装与示例。',
    href: '/skills',
    version: 1,
    enabled: true,
    capabilities: ['catalog', 'inspect', 'download', 'configure'],
  },
  {
    id: 'presentations',
    name: '演示资料',
    description: 'PPT/PDF 归档、封面、版本与公开预览。',
    href: '/presentations',
    version: 1,
    enabled: true,
    capabilities: ['upload', 'preview', 'version', 'share'],
  },
  {
    id: 'knowledge',
    name: '知识库',
    description: '收藏、笔记、文档与可检索知识。',
    href: '/knowledge',
    version: 1,
    enabled: false,
    capabilities: ['capture', 'tag', 'search'],
  },
  {
    id: 'automations',
    name: '自动任务',
    description: '定时采集、内容生成、发布和通知。',
    href: '/automations',
    version: 1,
    enabled: true,
    capabilities: ['schedule', 'run', 'retry', 'notify'],
  },
  {
    id: 'sandboxes',
    name: 'Sandbox 实验室',
    description: '隔离执行环境的试验、比较与观测。',
    href: '/sandboxes',
    version: 1,
    enabled: false,
    capabilities: ['launch', 'execute', 'observe'],
  },
];

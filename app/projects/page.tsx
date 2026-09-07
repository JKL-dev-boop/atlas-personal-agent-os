import { GitCompareArrows, Radar, Star } from 'lucide-react';

import { SectionShell } from '@/components/section-shell';
import { Badge } from '@/components/ui/badge';
import { dailyBrief, dailyDisplay } from '@/lib/daily-data';

export default function ProjectsPage() {
  return (
    <SectionShell eyebrow="PROJECT RADAR" title="项目雷达" description="日报关注“今天发生什么”，项目雷达负责积累长期认知：一个项目为何反复出现、它真正改变了什么，以及是否值得投入。">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [Radar, '持续跟踪', '保存每日仓库快照和领域分类，不因项目当天未上榜就丢失观察。'],
          [GitCompareArrows, '变化优先', '重复项目重点展示 Release、功能、文档与架构变化，而不是重复简介。'],
          [Star, '可信热度', '总 Star 来自 GitHub；日增量来自连续快照，没有基线时明确标空。'],
        ].map(([Icon, title, description]) => {
          const CardIcon = Icon as typeof Radar;
          return <article key={title as string} className="rounded-2xl border border-white/8 bg-card p-6"><CardIcon className="size-5 text-cyan-300" /><h2 className="mt-8 text-sm font-semibold text-white">{title as string}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{description as string}</p></article>;
        })}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/8 bg-card">
        <div className="flex items-center justify-between border-b border-white/7 px-5 py-4">
          <div><h2 className="text-sm font-semibold text-white">最新跟踪项目</h2><p className="mt-1 text-[11px] text-slate-500">最新快照 · {dailyDisplay.editionDate}</p></div>
          <Badge className="bg-emerald-400/10 text-emerald-300">{dailyBrief.payload.projects.length} 个</Badge>
        </div>
        {dailyBrief.payload.projects.map((project, index) => (
          <a key={project.repository} href={project.url} target="_blank" rel="noreferrer" className={`grid gap-3 px-5 py-4 transition-colors hover:bg-white/[0.025] sm:grid-cols-[32px_minmax(0,1fr)_auto] ${index ? 'border-t border-white/7' : ''}`}>
            <span className="font-mono text-[10px] text-slate-600">{String(index + 1).padStart(2, '0')}</span>
            <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-200">{project.repository}</p><p className="mt-1 truncate text-[11px] text-slate-500">{project.change}</p></div>
            <span className="text-[11px] text-slate-500">{project.totalStars?.toLocaleString('zh-CN') ?? '未知'} ★</span>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

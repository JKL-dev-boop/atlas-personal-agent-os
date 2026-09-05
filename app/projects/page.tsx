import { GitCompareArrows, Radar, Star } from 'lucide-react';

import { SectionShell } from '@/components/section-shell';

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
      <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-xs text-slate-500">项目会在首次日报采集后自动进入雷达。</div>
    </SectionShell>
  );
}

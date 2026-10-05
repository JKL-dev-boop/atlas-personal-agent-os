import { ArrowUpRight, CheckCircle2, Clock3, Layers3, Sparkles, Star, Tags } from 'lucide-react';

import { SectionShell } from '@/components/section-shell';
import { Badge } from '@/components/ui/badge';
import {
  weeklyCategoryLabels,
  weeklyDigest,
  weeklyDisplay,
  weeklyFeaturedProjects,
  weeklyProjectsByCategory,
} from '@/lib/weekly-data';

const formatStars = (stars: number) => stars.toLocaleString('zh-CN');

export default function WeeklyPage() {
  const { payload } = weeklyDigest;

  return (
    <SectionShell
      eyebrow="WEEKLY GITHUB PANORAMA"
      title="GitHub 周度全景"
      description="完整观察本期 GitHub Trending 周榜，再按真实用途分到跨领域大类；日报继续负责你的重点方向，周榜负责扩展视野。"
    >
      <section className="rounded-2xl border border-white/8 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-white">{weeklyDisplay.snapshotDate}</h2>
              <Badge className="bg-emerald-400/10 text-emerald-300"><CheckCircle2 />周榜采集完整</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">{weeklyDigest.summary}</p>
          </div>
          <p className="flex items-center gap-2 text-[11px] text-slate-500"><Clock3 className="size-3.5" />{payload.timezone} · {weeklyDisplay.capturedTime} 快照</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['周榜项目', String(payload.projects.length), '本次 Trending weekly 全量观察'],
            ['重点信号', String(payload.featured.length), '兼顾增速与跨领域价值'],
            ['分类体系', String(payload.categoryOrder.length), `本期 ${weeklyDisplay.activeCategoryCount} 类有项目`],
            ['Taxonomy', `v${payload.taxonomyVersion}`, 'ATLAS 编辑分类，不是 GitHub 官方标签'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-white/7 bg-white/[0.025] p-4">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-cyan-300/15 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2"><Sparkles className="size-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">本周最值得先看</h2></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          {weeklyFeaturedProjects.map((project) => (
            <a key={project.repository} href={project.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/7 bg-white/[0.02] p-4 transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/[0.035]">
              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600"><span>#{project.rank}</span><span className="text-emerald-300">+{formatStars(project.weeklyStars)}</span></div>
              <h3 className="mt-5 break-words text-xs font-semibold text-slate-100">{project.repository}</h3>
              <p className="mt-2 text-[10px] text-cyan-300">{weeklyCategoryLabels[project.primaryCategory]}</p>
            </a>
          ))}
        </div>
      </section>

      <nav className="mt-5 rounded-2xl border border-white/8 bg-card p-5" aria-label="周榜分类">
        <div className="flex items-center gap-2"><Layers3 className="size-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">按领域浏览</h2></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {payload.categoryOrder.map((category) => {
            const count = weeklyProjectsByCategory.get(category)?.length ?? 0;
            return (
              <a key={category} href={count ? `#${category}` : undefined} aria-disabled={count === 0} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${count ? 'border-white/8 text-slate-300 hover:border-cyan-300/25 hover:text-cyan-200' : 'cursor-not-allowed border-white/5 text-slate-600'}`}>
                <span>{weeklyCategoryLabels[category]}</span><span className="font-mono text-[10px]">{count}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <div className="mt-5 space-y-6">
        {payload.categoryOrder.map((category) => {
          const projects = weeklyProjectsByCategory.get(category) ?? [];
          if (!projects.length) return null;
          return (
            <section key={category} id={category} className="scroll-mt-6 rounded-2xl border border-white/8 bg-card p-5 md:p-6">
              <div className="flex items-end justify-between gap-3 border-b border-white/7 pb-4">
                <div><p className="text-[10px] font-semibold tracking-[0.16em] text-cyan-300">{category.toUpperCase()}</p><h2 className="mt-1 text-lg font-semibold text-white">{weeklyCategoryLabels[category]}</h2></div>
                <p className="text-[11px] text-slate-500">{projects.length} 个项目</p>
              </div>
              <div className="divide-y divide-white/7">
                {projects.map((project) => (
                  <article key={project.repository} className="grid gap-5 py-5 first:pt-5 lg:grid-cols-[minmax(0,1fr)_230px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-600">#{project.rank}</span>
                        <a href={project.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-100 hover:text-cyan-200">{project.repository}</a>
                        <Badge variant="outline" className="border-white/8 text-[10px] text-slate-500">{project.language ?? '多语言'}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => <Badge key={tag} variant="outline" className="border-white/8 text-[10px] text-slate-500">{tag}</Badge>)}
                      </div>
                      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500"><Tags className="mt-0.5 size-3.5 shrink-0 text-slate-600" />{project.stack.join(' · ')}</p>
                    </div>
                    <aside className="rounded-xl border border-white/7 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="flex items-center gap-1.5 text-xs text-slate-200"><Star className="size-3.5 text-amber-300" />{formatStars(project.totalStars)}</p>
                        <p className="text-xs font-medium text-emerald-300">+{formatStars(project.weeklyStars)} / 周</p>
                      </div>
                      <p className="mt-3 text-[10px] leading-5 text-slate-500">{project.heatEvidence}</p>
                      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-white/7 pt-3">
                        {project.sources.map((source, index) => <a key={source} href={source} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-300">来源 {index + 1}<ArrowUpRight className="size-3" /></a>)}
                      </div>
                    </aside>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-5 rounded-2xl border border-white/8 bg-card p-5">
        <h2 className="text-xs font-semibold text-white">口径说明</h2>
        <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">{payload.notes?.map((note) => <li key={note}>· {note}</li>)}</ul>
        <a href={payload.source.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[10px] text-cyan-300">打开 GitHub Trending 周榜<ArrowUpRight className="size-3" /></a>
      </section>
    </SectionShell>
  );
}

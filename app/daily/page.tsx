import { ArrowUpRight, CheckCircle2, Clock3, Sparkles, Star } from 'lucide-react';

import { SectionShell } from '@/components/section-shell';
import { Badge } from '@/components/ui/badge';
import { dailyBrief } from '@/lib/daily-data';

const categoryLabels = {
  'ai-agent': 'AI / Agent',
  application: '应用项目',
  'sandbox-infra': 'Sandbox 基础设施',
};

const formatStars = (stars: number | null) => stars === null ? '未知' : stars.toLocaleString('zh-CN');

export default function DailyPage() {
  const { payload } = dailyBrief;
  const featured = new Set(payload.featured);

  return (
    <SectionShell
      eyebrow="DAILY INTELLIGENCE"
      title="GitHub 日报"
      description="每天从 GitHub 热点和重要发布中筛出真正值得投入时间的项目，并判断它们对 Agent Sandbox 的参考价值。"
    >
      <section className="rounded-2xl border border-white/8 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">2026 年 9 月 6 日</h2>
              <Badge className="bg-emerald-400/10 text-emerald-300"><CheckCircle2 />采集成功</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400">{dailyBrief.summary}</p>
          </div>
          <p className="flex items-center gap-2 text-[11px] text-slate-500"><Clock3 className="size-3.5" />Asia/Shanghai · 09:08 完成</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['完整项目', '10', '日榜 7 · 周榜 3'],
            ['重点推荐', '5', '优先匹配 Agent Sandbox'],
            ['可信日增量', '7', '周榜项目日增量留空'],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-xl border border-white/7 bg-white/[0.025] p-4">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-[11px] text-slate-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {payload.projects.map((project, index) => (
          <article key={project.repository} className={`rounded-2xl border bg-card p-5 md:p-6 ${featured.has(project.repository) ? 'border-cyan-300/20' : 'border-white/8'}`}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-600">{String(index + 1).padStart(2, '0')}</span>
                  <a href={project.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-100 hover:text-cyan-200">{project.repository}</a>
                  {featured.has(project.repository) && <Badge className="bg-cyan-400/10 text-cyan-300"><Sparkles />重点</Badge>}
                  <Badge variant="outline" className="border-white/10 text-slate-400">{categoryLabels[project.category]}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((item) => <Badge key={item} variant="outline" className="border-white/8 text-[10px] text-slate-500">{item}</Badge>)}
                </div>

                <dl className="mt-5 grid gap-4 text-xs md:grid-cols-2">
                  <div><dt className="text-cyan-300">与你的关联</dt><dd className="mt-1.5 leading-5 text-slate-400">{project.relevance}</dd></div>
                  <div><dt className="text-cyan-300">成熟度与限制</dt><dd className="mt-1.5 leading-5 text-slate-400">{project.maturity}</dd></div>
                  {project.change && <div><dt className="text-cyan-300">本次变化</dt><dd className="mt-1.5 leading-5 text-slate-400">{project.change}</dd></div>}
                  <div><dt className="text-cyan-300">阅读建议</dt><dd className="mt-1.5 font-medium text-slate-200">{project.recommendation}</dd></div>
                </dl>
              </div>

              <aside className="rounded-xl border border-white/7 bg-white/[0.02] p-4">
                <p className="flex items-center gap-1.5 text-sm text-slate-200"><Star className="size-4 text-amber-300" />{formatStars(project.totalStars)}</p>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">{project.heatEvidence}</p>
                {project.release && <p className="mt-3 border-t border-white/7 pt-3 text-[11px] text-emerald-300">Release · {project.release}</p>}
                <div className="mt-4 space-y-2">
                  {project.sources.map((source, sourceIndex) => (
                    <a key={source} href={source} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-300">来源 {sourceIndex + 1}<ArrowUpRight className="size-3" /></a>
                  ))}
                </div>
              </aside>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-5 rounded-2xl border border-white/8 bg-card p-5">
        <p className="text-xs font-semibold text-white">采集说明</p>
        <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">
          {payload.collection.notes?.map((note) => <li key={note}>· {note}</li>)}
        </ul>
      </section>
    </SectionShell>
  );
}

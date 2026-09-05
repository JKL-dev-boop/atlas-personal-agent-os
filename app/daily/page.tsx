import { AlertCircle, Check, Clock3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SectionShell } from '@/components/section-shell';

const fields = ['功能概要', '技术栈', '热度依据', '与你的关联', '成熟度与限制', '阅读建议'];

export default function DailyPage() {
  return (
    <SectionShell
      eyebrow="DAILY INTELLIGENCE"
      title="GitHub 日报"
      description="每天从 GitHub 热点和重要发布中筛出真正值得投入时间的项目，并判断它们对 Agent Sandbox 的参考价值。"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-white/8 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/7 pb-5">
            <div><h2 className="font-semibold text-white">今日版次</h2><p className="mt-1 text-xs text-slate-500">2026-09-06 · Asia/Shanghai</p></div>
            <Badge variant="outline" className="border-amber-300/20 bg-amber-300/5 text-amber-200"><Clock3 />等待首次采集</Badge>
          </div>
          <div className="py-14 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/8 bg-white/[0.03] text-slate-500"><AlertCircle className="size-5" /></div>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">首份真实日报尚未生成</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">自动任务将在北京时间 09:00 采集并验证项目。生成前不会用示例内容冒充今日数据。</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-card p-5">
            <p className="text-xs font-semibold text-white">每个项目都会确认</p>
            <div className="mt-4 space-y-3">{fields.map((field) => <p key={field} className="flex items-center gap-2 text-xs text-slate-400"><Check className="size-3.5 text-cyan-300" />{field}</p>)}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-cyan-400/[0.035] p-5">
            <p className="text-xs text-cyan-200">筛选原则</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">优先 README、文档、依赖配置和 Release；Trending 只作为信号，不作为事实结论。</p>
          </div>
        </aside>
      </div>
    </SectionShell>
  );
}

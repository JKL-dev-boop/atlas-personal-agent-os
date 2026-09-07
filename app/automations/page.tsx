import { CheckCircle2, CircleDashed, Clock3, Send, Waypoints } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SectionShell } from '@/components/section-shell';
import { dailyDisplay } from '@/lib/daily-data';

const pipeline = [
  ['09:01', '采集', 'Trending 日榜、周榜与项目元数据'],
  ['09:03', '验证', 'README、依赖、Release 与限制'],
  [dailyDisplay.completedTime, '归档', '完整 10 项日报与项目连续快照'],
  ['完成', '发布', 'GitHub、网站与 5 项重点通知'],
];

export default function AutomationsPage() {
  return (
    <SectionShell eyebrow="AUTOMATION CONTROL" title="自动任务" description="采集、分析、发布和通知彼此独立记录。任何一步失败都会显式呈现，不会把过期内容当作今日结果。">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-white/8 bg-card p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold text-white">GitHub 日报流水线</h2><p className="mt-1 text-xs text-slate-500">每天 · Asia/Shanghai</p></div><Badge className="bg-cyan-400/10 text-cyan-300"><Clock3 />09:00</Badge></div>
          <div className="mt-7 space-y-0">
            {pipeline.map(([time, title, detail], index) => (
              <div key={title} className="grid grid-cols-[48px_24px_1fr] gap-3 text-xs">
                <span className="pt-0.5 font-mono text-slate-500">{time}</span>
                <div className="flex flex-col items-center"><CircleDashed className="size-4 text-cyan-300" />{index < pipeline.length - 1 && <span className="h-12 w-px bg-white/8" />}</div>
                <div><p className="font-medium text-slate-200">{title}</p><p className="mt-1 text-slate-500">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-card p-5"><Waypoints className="size-4 text-cyan-300" /><p className="mt-5 text-sm font-medium text-white">解耦执行</p><p className="mt-2 text-xs leading-5 text-slate-500">网站发布失败不会阻止消息推送；推送失败也不会丢失已经生成的日报。</p></div>
          <div className="rounded-2xl border border-white/8 bg-card p-5"><Send className="size-4 text-violet-300" /><p className="mt-5 text-sm font-medium text-white">初始渠道</p><p className="mt-2 text-xs leading-5 text-slate-500">先在当前 Codex 任务中定时推送，后续可按需连接邮件或其他通知渠道。</p></div>
          <p className="flex items-center gap-2 px-1 text-[11px] text-slate-500"><CheckCircle2 className="size-3.5 text-emerald-400" />{dailyDisplay.editionDate} 已完成采集、归档与发布</p>
        </aside>
      </div>
    </SectionShell>
  );
}

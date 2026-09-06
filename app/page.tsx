import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CodeXml,
  FileText,
  GalleryVerticalEnd,
  GitBranch,
  LayoutGrid,
  Library,
  Search,
  Settings2,
  Sparkles,
  Star,
  TerminalSquare,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dailyBrief, featuredProjects } from '@/lib/daily-data';

const projects = featuredProjects.slice(0, 3).map((project, index) => ({
  rank: String(index + 1).padStart(2, '0'),
  name: project.repository,
  summary: project.relevance,
  tags: project.stack.slice(0, 3),
  stars: project.totalStars?.toLocaleString('zh-CN') ?? '未知',
  signal: project.dailyStars === null ? `${project.trending?.stars.toLocaleString('zh-CN')} / 周` : `+${project.dailyStars.toLocaleString('zh-CN')} / 日`,
}));

const nav = [
  { label: '总览', icon: LayoutGrid, href: '/', active: true },
  { label: '情报日报', icon: BookOpen, href: '/daily' },
  { label: '项目雷达', icon: CodeXml, href: '/projects' },
  { label: '演示资料', icon: GalleryVerticalEnd, href: '/presentations' },
  { label: '知识库', icon: Library, href: '/knowledge' },
  { label: '自动任务', icon: Bot, href: '/automations' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1560px] items-center gap-4 px-4 lg:px-7">
          <div className="flex min-w-fit items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <TerminalSquare className="size-[18px]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold tracking-wide text-white">ATLAS / 个人工作台</p>
              <p className="text-[10px] tracking-[0.18em] text-slate-500">PERSONAL AGENT OS</p>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-slate-500 md:flex">
            <Search className="size-4" />
            <span>搜索项目、日报、资料与任务…</span>
            <kbd className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">⌘ K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              平台就绪
            </div>
            <Button variant="ghost" size="icon" aria-label="设置"><Settings2 /></Button>
            <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 text-xs font-bold text-slate-950">ME</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1560px] grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-64px)] border-r border-white/7 px-4 py-6 lg:flex lg:flex-col">
          <nav className="space-y-1" aria-label="主导航">
            {nav.map((item) => (
              <a key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${item.active ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>
                <item.icon className="size-4" />
                {item.label}
                {item.label === '情报日报' && <span className="ml-auto rounded-full bg-cyan-300 px-1.5 py-0.5 text-[9px] font-bold text-slate-950">10</span>}
              </a>
            ))}
          </nav>

          <div className="mt-7 border-t border-white/7 pt-6">
            <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-600">即将接入</p>
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p className="flex items-center gap-3 px-3 py-2"><Box className="size-4" />实验环境</p>
              <p className="flex items-center gap-3 px-3 py-2"><GitBranch className="size-4" />项目管理</p>
              <p className="flex items-center gap-3 px-3 py-2"><Sparkles className="size-4" />AI 工作流</p>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400"><Clock3 className="size-3.5" />下次运行</div>
            <p className="mt-2 text-xl font-semibold text-white">09:00</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">GitHub 日报 · 北京时间<br />最近成功 09:08</p>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-7 md:px-7 xl:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-cyan-300"><span className="h-px w-6 bg-cyan-300/60" /> 2026年9月6日 · 星期日</div>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">早上好，今天值得关注这些。</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">从噪音中提取信号，把项目、知识、资料和自动化放进同一个可持续生长的系统。</p>
            </div>
            <Link href="/daily" className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-200">查看今日日报 <ArrowUpRight className="size-4" /></Link>
          </div>

          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] px-4 py-3 text-xs leading-5 text-emerald-100/75">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            <p>今日真实日报已完成采集与核对。日榜 7 项、周榜 3 项；周榜项目无法确认日增量时已明确留空。</p>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['今日项目', String(dailyBrief.payload.projects.length), '日榜 7 · 周榜 3'],
              ['重点信号', String(dailyBrief.payload.featured.length), '已完成 09:00 推送'],
              ['资料库', '0', '等待首份 PDF'],
              ['自动任务', '1', '运行正常'],
            ].map(([label, value, note], index) => (
              <div key={label} className="metric-card rounded-2xl border border-white/8 bg-card p-4">
                <div className="flex items-start justify-between"><p className="text-xs text-slate-500">{label}</p><span className={`size-1.5 rounded-full ${index === 3 ? 'bg-emerald-400' : 'bg-slate-600'}`} /></div>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-[11px] text-slate-500">{note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <div><h2 className="font-semibold text-white">今日重点</h2><p className="mt-0.5 text-xs text-slate-500">AI · 应用 · Agent Sandbox</p></div>
                <Link href="/daily" className="flex items-center gap-1 text-xs text-cyan-300">全部 10 个 <ChevronRight className="size-3.5" /></Link>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
                {projects.map((project, index) => (
                  <article key={project.name} className={`group grid gap-4 p-5 sm:grid-cols-[42px_minmax(0,1fr)_auto] ${index ? 'border-t border-white/7' : ''}`}>
                    <span className="font-mono text-xs text-slate-600">{project.rank}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-slate-100 group-hover:text-cyan-200">{project.name}</h3>{index === 0 && <Badge className="bg-cyan-400/12 text-cyan-300">首选</Badge>}</div>
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">{project.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">{project.tags.map((tag) => <Badge key={tag} variant="outline" className="border-white/8 text-[10px] text-slate-500">{tag}</Badge>)}</div>
                    </div>
                    <div className="flex items-center gap-5 self-start text-right sm:block">
                      <p className="flex items-center justify-end gap-1 text-xs text-slate-300"><Star className="size-3.5 text-amber-300" /> {project.stars}</p>
                      <p className="mt-1 text-[10px] text-emerald-400">{project.signal}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-white">演示资料</h2><Link href="/presentations" className="text-xs text-cyan-300">资料库</Link></div>
                <div className="presentation-card relative overflow-hidden rounded-2xl border border-white/8 p-5">
                  <div className="relative z-10">
                    <div className="grid size-10 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><FileText className="size-5" /></div>
                    <p className="mt-8 text-[10px] font-semibold tracking-[0.16em] text-violet-300">PRESENTATION LIBRARY</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">你的演示内容中心</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-400">上传 PPT 或 PDF，自动生成封面、网页预览、版本记录与分享链接。</p>
                    <Button variant="outline" className="mt-5 border-white/10 bg-white/5 text-slate-200">添加第一份资料 <ArrowUpRight /></Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-white">运行状态</h2><span className="text-[10px] text-slate-500">刚刚检查</span></div>
                <div className="rounded-2xl border border-white/8 bg-card p-5">
                  {[
                    ['Trending 采集', '成功', '09:03'],
                    ['内容分析', '成功', '09:08'],
                    ['网站发布', '进行中', '当前'],
                  ].map(([name, state, time]) => (
                    <div key={name} className="flex items-center py-2.5 text-xs first:pt-0 last:pb-0"><CheckCircle2 className="mr-2.5 size-4 text-emerald-400" /><span className="text-slate-300">{name}</span><span className="ml-auto text-slate-500">{state} · {time}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="mt-8 border-t border-white/7 pt-7">
            <div className="mb-4"><h2 className="font-semibold text-white">能力模块</h2><p className="mt-1 text-xs text-slate-500">工作台会随你的需求持续生长，而不是被日报形态限制。</p></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [Bot, 'AI 工作流', '组织可复用的 Agent 任务与提示词'],
                [Library, '个人知识库', '收藏、笔记、文档与语义检索'],
                [Box, 'Sandbox 实验室', '运行与比较隔离执行环境'],
                [GitBranch, '项目控制台', '集中追踪仓库、版本与待办'],
              ].map(([Icon, title, desc]) => {
                const ModuleIcon = Icon as typeof Bot;
                return <div key={title as string} className="rounded-2xl border border-dashed border-white/10 p-4 transition-colors hover:border-cyan-400/25 hover:bg-cyan-400/[0.025]"><ModuleIcon className="size-4 text-slate-500" /><h3 className="mt-5 text-sm font-medium text-slate-200">{title as string}</h3><p className="mt-1 text-[11px] leading-5 text-slate-500">{desc as string}</p></div>;
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

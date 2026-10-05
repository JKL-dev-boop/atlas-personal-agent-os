import type { Metadata } from 'next';
import { ArrowUpRight, CheckCircle2, Download, FileCode2, ShieldAlert, Workflow } from 'lucide-react';

import { CopyPromptButton } from '@/components/copy-prompt-button';
import { SectionShell } from '@/components/section-shell';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { featuredSkill, formatBytes } from '@/lib/skill-data';

const skill = featuredSkill.payload;

export const metadata: Metadata = {
  title: 'PR Self-Test Orchestrator · ATLAS Skill 库',
  description: featuredSkill.summary,
  openGraph: {
    title: 'PR Self-Test Orchestrator · ATLAS Skill 库',
    description: featuredSkill.summary,
    images: [],
  },
  twitter: {
    title: 'PR Self-Test Orchestrator · ATLAS Skill 库',
    description: featuredSkill.summary,
    images: [],
  },
};

const permissionTone = {
  none: 'bg-emerald-400/10 text-emerald-300',
  read: 'bg-blue-400/10 text-blue-300',
  write: 'bg-amber-400/10 text-amber-200',
  controlled: 'bg-violet-400/10 text-violet-200',
};

export default function SkillDetailPage() {
  return (
    <SectionShell eyebrow="SKILL / SOURCE-EXACT RELEASE" title={featuredSkill.title} description={featuredSkill.summary}>
      <section className="rounded-2xl border border-cyan-300/18 bg-card p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-cyan-400/10 text-cyan-300">Agent Skill</Badge>
              <Badge variant="outline" className="border-white/10 text-slate-400">{skill.lifecycle}</Badge>
              <Badge className="bg-emerald-400/10 text-emerald-300"><CheckCircle2 />原始 ZIP 哈希与结构已核对</Badge>
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">固定版本，可下载，也可交给 Agent 安装</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              此下载包与“小分析师”会话最后生成的 ZIP 保持逐字节一致，包含 Skill 指令、模板、辅助脚本及明确标注为合成的预览/示例。Agent 可按下方 Prompt 完成受限校验和项目级安装；执行测试、访问环境或读取密钥仍需要独立授权。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={skill.download.href} download={skill.download.fileName} className={buttonVariants({ className: 'bg-cyan-300 text-slate-950 hover:bg-cyan-200' })}>
                <Download /> 下载 {formatBytes(skill.download.sizeBytes)} ZIP
              </a>
              {skill.links.filter((link) => link.type === 'source' || link.type === 'manifest').map((link) => (
                <a key={link.type} href={link.href} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline' })}>
                  {link.label} <ArrowUpRight />
                </a>
              ))}
            </div>
          </div>
          <aside className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-slate-500">版本</p><p className="mt-1 font-mono text-slate-200">{skill.version.label}</p></div>
              <div><p className="text-slate-500">验证</p><p className="mt-1 text-emerald-300">package-validated</p></div>
              <div><p className="text-slate-500">分发</p><p className="mt-1 text-slate-200">ZIP + 源码</p></div>
              <div><p className="text-slate-500">范围</p><p className="mt-1 text-slate-200">项目级优先</p></div>
              <div><p className="text-slate-500">ZIP 条目</p><p className="mt-1 text-slate-200">{skill.download.entryCount} 项</p></div>
              <div><p className="text-slate-500">许可</p><p className="mt-1 text-amber-200">未声明</p></div>
            </div>
            <div className="mt-4 border-t border-white/7 pt-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">SHA-256</p>
              <code className="mt-2 block break-all text-[10px] leading-4 text-slate-400">{skill.download.sha256}</code>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/8 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2"><Workflow className="size-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">工作闭环</h2></div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {skill.workflow.map((step, index) => (
            <li key={step} className="rounded-xl border border-white/7 bg-white/[0.02] p-3 text-xs leading-5 text-slate-400">
              <span className="mr-2 font-mono text-[10px] text-cyan-300">{String(index + 1).padStart(2, '0')}</span>{step}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-card p-5">
          <div className="flex items-center gap-2"><FileCode2 className="size-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">目录结构</h2></div>
          <div className="mt-4 space-y-2">
            {skill.structure.map((item) => (
              <div key={item.path} className="rounded-xl border border-white/7 bg-white/[0.02] p-3">
                <code className="text-[11px] text-cyan-200">{item.path}</code>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{item.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-card p-5">
          <h2 className="text-sm font-semibold text-white">主要能力</h2>
          <div className="mt-4 space-y-3">
            {skill.capabilities.map((capability) => (
              <div key={capability.name}>
                <p className="text-xs font-medium text-slate-200">{capability.name}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{capability.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-white/8 bg-card p-5 md:p-6">
        <div className="flex items-center gap-2"><ShieldAlert className="size-4 text-amber-300" /><h2 className="text-sm font-semibold text-white">权限与执行边界</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {skill.permissions.map((permission) => (
            <div key={permission.surface} className="rounded-xl border border-white/7 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-200">{permission.surface}</p><Badge className={permissionTone[permission.level]}>{permission.level}</Badge></div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">{permission.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-cyan-300/15 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-sm font-semibold text-white">交给 Agent 自动安装与配置</h2><p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">复制下面的 Prompt 到目标项目里的 Agent。它会先校验哈希、审查包内容并限制写入路径；完成安装后只生成安全配置草稿，不会直接运行测试。</p></div>
          <CopyPromptButton text={skill.installPrompt} />
        </div>
        <pre className="mt-5 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/8 bg-black/25 p-4 text-[11px] leading-5 text-slate-300">{skill.installPrompt}</pre>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/8 bg-card p-5">
          <h2 className="text-sm font-semibold text-white">限制</h2>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">{skill.limitations.map((item) => <li key={item}>· {item}</li>)}</ul>
        </section>
        <section className="rounded-2xl border border-white/8 bg-card p-5">
          <h2 className="text-sm font-semibold text-white">安全说明</h2>
          <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-500">{skill.safetyNotes.map((item) => <li key={item}>· {item}</li>)}</ul>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-white/8 bg-card p-5">
        <h2 className="text-sm font-semibold text-white">来源与说明</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {skill.links.filter((link) => link.type !== 'source' && link.type !== 'manifest' && link.type !== 'download').map((link) => (
            <a key={link.type} href={link.href} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline', size: 'sm' })}>{link.label}<ArrowUpRight /></a>
          ))}
        </div>
      </section>
    </SectionShell>
  );
}

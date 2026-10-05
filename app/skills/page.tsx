import { ArrowUpRight, Boxes, CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { SectionShell } from '@/components/section-shell';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { formatBytes, skillCatalog } from '@/lib/skill-data';

const verificationLabels = {
  unverified: '未验证',
  'metadata-verified': '元数据已核对',
  'package-validated': '包已验证',
  'install-tested': '安装已验证',
};

export default function SkillsPage() {
  return (
    <SectionShell
      eyebrow="AGENT CAPABILITY CATALOG"
      title="Skill 库"
      description="把可复用 Agent 能力作为可追溯的软件制品管理：看得懂结构、权限和限制，也能下载固定版本交给 Agent 安全安装。"
    >
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          [Boxes, '结构透明', '展示 SKILL.md、脚本、参考资料和资产各自承担的职责。'],
          [ShieldCheck, '安装与运行分离', '安装不会自动授权测试、生产访问、密钥读取或外部写入。'],
          [CheckCircle2, '版本可验证', '固定下载地址同时公布版本、大小和 SHA-256。'],
        ].map(([Icon, title, description]) => {
          const CardIcon = Icon as typeof Boxes;
          return (
            <article key={title as string} className="rounded-2xl border border-white/8 bg-card p-5">
              <CardIcon className="size-5 text-cyan-300" />
              <h2 className="mt-6 text-sm font-semibold text-white">{title as string}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">{description as string}</p>
            </article>
          );
        })}
      </section>

      <div className="mt-5 space-y-4">
        {skillCatalog.map((record) => {
          const skill = record.payload;
          return (
            <article key={record.id} className="rounded-2xl border border-cyan-300/15 bg-card p-5 md:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-cyan-400/10 text-cyan-300">Agent Skill</Badge>
                    <Badge variant="outline" className="border-white/10 text-slate-400">{skill.lifecycle}</Badge>
                    <Badge className="bg-emerald-400/10 text-emerald-300">{verificationLabels[skill.verification]}</Badge>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-white">{record.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{record.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/skills/${skill.slug}`} className={buttonVariants({ className: 'bg-cyan-300 text-slate-950 hover:bg-cyan-200' })}>
                      查看结构与安装 <ArrowUpRight />
                    </Link>
                    <a href={skill.download.href} download={skill.download.fileName} className={buttonVariants({ variant: 'outline' })}>
                      下载 ZIP <Download />
                    </a>
                  </div>
                </div>
                <aside className="rounded-xl border border-white/7 bg-white/[0.025] p-4 text-xs">
                  <p className="text-slate-500">固定版本</p>
                  <p className="mt-1 font-mono text-slate-200">{skill.version.label}</p>
                  <p className="mt-4 text-slate-500">包大小</p>
                  <p className="mt-1 text-slate-200">{formatBytes(skill.download.sizeBytes)}</p>
                  <p className="mt-4 text-slate-500">兼容性</p>
                  <p className="mt-1 text-slate-200">Codex · 项目级优先</p>
                  <p className="mt-4 text-slate-500">公开内容</p>
                  <p className="mt-1 leading-5 text-slate-400">小分析师原始最新包；含合成示例与预览，不含真实运行证据或线程导出。</p>
                </aside>
              </div>
            </article>
          );
        })}
      </div>
    </SectionShell>
  );
}

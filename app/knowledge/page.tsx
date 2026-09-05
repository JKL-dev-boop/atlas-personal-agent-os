import { Library } from 'lucide-react';
import { SectionShell } from '@/components/section-shell';

export default function KnowledgePage() {
  return <SectionShell eyebrow="KNOWLEDGE BASE" title="个人知识库" description="后续用于归档笔记、收藏、文档和从日报沉淀的技术判断。"><div className="rounded-2xl border border-dashed border-white/10 py-16 text-center"><Library className="mx-auto size-6 text-slate-600" /><p className="mt-4 text-sm text-slate-400">模块接口已预留，将在你提供第一批知识资料时启用。</p></div></SectionShell>;
}

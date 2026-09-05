import { FileUp, Globe2, History, ScanSearch } from 'lucide-react';

import { SectionShell } from '@/components/section-shell';

const steps = [
  [FileUp, '接收文件', '把 PPT、PPTX 或 PDF 交给我，并说明标题和是否公开。'],
  [ScanSearch, '预检与封面', '检查页面、字体、裁切和文件大小，生成展示封面。'],
  [History, '版本归档', '采用稳定命名并保留历史版本和更新说明。'],
  [Globe2, '公开预览', '在网站生成固定详情页、在线预览与下载链接。'],
];

export default function PresentationsPage() {
  return (
    <SectionShell eyebrow="PRESENTATION LIBRARY" title="演示资料" description="你的对外演示内容中心。公开资料与私人源文件分层存放，避免为了方便预览而牺牲安全性。">
      <div className="rounded-2xl border border-dashed border-white/12 bg-card/60 px-6 py-14 text-center">
        <FileUp className="mx-auto size-7 text-violet-300" />
        <h2 className="mt-4 font-semibold text-white">等待第一份演示资料</h2>
        <p className="mt-2 text-xs text-slate-500">收到文件后，这里会出现封面、简介、页数、版本、预览与下载入口。</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([Icon, title, description]) => {
          const StepIcon = Icon as typeof FileUp;
          return <article key={title as string} className="rounded-2xl border border-white/8 bg-card p-5"><StepIcon className="size-4 text-violet-300" /><h3 className="mt-6 text-sm font-medium text-white">{title as string}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{description as string}</p></article>;
        })}
      </div>
    </SectionShell>
  );
}

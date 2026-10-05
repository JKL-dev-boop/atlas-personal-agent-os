'use client';

import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function CopyPromptButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  };

  return (
    <Button type="button" variant="outline" onClick={copy} aria-live="polite">
      {state === 'copied' ? <Check /> : state === 'failed' ? <TriangleAlert /> : <Copy />}
      {state === 'copied' ? '已复制' : state === 'failed' ? '复制失败，请手动选取' : '复制安装 Prompt'}
    </Button>
  );
}

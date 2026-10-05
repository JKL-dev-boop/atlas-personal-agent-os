import { ArrowLeft, Boxes, BookOpen, TerminalSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const sectionNav = [
  { href: '/daily', label: '日报', icon: BookOpen },
  { href: '/weekly', label: '周度全景', icon: TrendingUp },
  { href: '/skills', label: 'Skill 库', icon: Boxes },
];

export function SectionShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/8 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3 text-sm text-slate-300">
            <span className="grid size-8 place-items-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><TerminalSquare className="size-4" /></span>
            <span className="font-semibold text-white">ATLAS</span>
          </Link>
          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-0.5" aria-label="内容导航">
              {sectionNav.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-cyan-300">
                  <item.icon className="size-3.5" /><span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
            <Link href="/" className="ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-cyan-300"><ArrowLeft className="size-3.5" /><span className="hidden sm:inline">总览</span></Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-cyan-300">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        <div className="mt-9">{children}</div>
      </div>
    </main>
  );
}

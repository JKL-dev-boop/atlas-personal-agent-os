import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const notoSansSC = Noto_Sans_SC({ variable: '--font-noto-sans-sc', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://atlas-personal-agent-os.copper-thyme-9347.chatgpt.site'),
  title: 'ATLAS · 个人 Agent OS',
  description: '集 GitHub 情报、演示资料、知识与自动化于一体的个人数字工作台。',
  openGraph: {
    title: 'ATLAS · 个人 Agent OS',
    description: '情报、知识、资料与自动化，汇聚成一个持续生长的个人数字工作台。',
    type: 'website',
    images: [{ url: '/og.png', width: 1732, height: 909, alt: 'ATLAS 个人 Agent OS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATLAS · 个人 Agent OS',
    description: '情报、知识、资料与自动化，汇聚成一个持续生长的个人数字工作台。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} antialiased`}>{children}</body>
    </html>
  );
}

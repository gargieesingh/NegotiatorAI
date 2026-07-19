import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { AiDisclosure } from '@/components/layout/AiDisclosure';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-primary',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'The Negotiator',
  description: 'An AI advocate for transparent moving quotes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen bg-negotiator-bg text-slate-100`}>
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <AiDisclosure />
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}

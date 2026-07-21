import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Providers from './providers';
import './globals.css';

const inter = localFont({
  src: [
    { path: '../../public/fonts/InterDisplay-Medium.woff2', weight: '400' },
  ],
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif'],
});

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Light.woff2', weight: '300' },
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500' },
    { path: '../../public/fonts/Satoshi-Bold.woff2', weight: '700' },
  ],
  variable: '--font-satoshi',
});

const interDisplay = localFont({
  src: [
    { path: '../../public/fonts/InterDisplay-Medium.woff2', weight: '500' },
  ],
  variable: '--font-inter-display',
});

export const metadata: Metadata = {
  title: 'The Negotiator',
  description: 'Your AI negotiation agent.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className="text-[calc(0.7rem+0.35vw)] max-[2300px]:text-[calc(0.7rem+0.32vw)] max-[2150px]:text-[calc(0.7rem+0.28vw)] max-4xl:text-[1rem]"
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${satoshi.variable} ${inter.variable} ${interDisplay.variable} bg-weak-50 font-satoshi text-p-sm text-strong-950 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

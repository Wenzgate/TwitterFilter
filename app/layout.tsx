import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'X Media Likes Dashboard',
  description: 'Visualisez et filtrez vos tweets likés contenant des médias.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-50`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                <Link href="/dashboard" className="text-lg font-semibold text-brand">
                  X Media Likes
                </Link>
                <nav className="flex items-center gap-4 text-sm text-neutral-300">
                  <Link href="/dashboard" className="hover:text-brand-foreground">
                    Dashboard
                  </Link>
                  <Link href="/stats" className="hover:text-brand-foreground">
                    Stats
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1 bg-neutral-950">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

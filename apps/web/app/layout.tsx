import type { Metadata } from 'next';
import { Cinzel, Spectral } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/site/JsonLd';
import { siteConfig } from '@/lib/site';

const cinzel = Cinzel({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const spectral = Spectral({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Escape the Prison Deckbuilder`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'dark fantasy deckbuilder',
    'Hollowfort',
    'browser card game',
    'prison escape',
    'roguelike deckbuilder',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Escape the Prison Deckbuilder`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Escape the Prison Deckbuilder`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${spectral.variable}`}>
      <body className="min-h-screen bg-[#0b0908] font-spectral text-[#e8ddcf] antialiased">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}


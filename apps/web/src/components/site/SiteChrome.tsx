import Link from 'next/link';
import { legalNav, siteConfig, siteNav } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[rgba(201,162,74,.18)] bg-[rgba(11,8,7,.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-cinzel text-lg tracking-[0.28em] text-ember-400">
          {siteConfig.name.toUpperCase()}
        </Link>
        <nav className="hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[11px] tracking-[0.16em] text-parchment-500 lg:flex">
          {siteNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-ember-400"
            >
              {item.label.toUpperCase()}
            </Link>
          ))}
        </nav>
        <Link
          href="/play"
          className="rounded border border-ember-500/50 bg-[linear-gradient(180deg,rgba(201,162,74,.2),rgba(90,50,20,.25))] px-3 py-2 font-cinzel text-[11px] tracking-[0.18em] text-parchment-100 transition hover:brightness-110"
        >
          ENTER
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(201,162,74,.14)] bg-[rgba(8,6,5,.85)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-cinzel text-sm tracking-[0.2em] text-ember-500">
          {siteConfig.name.toUpperCase()}
        </p>
        <div className="flex flex-wrap gap-4 text-[11px] tracking-[0.14em] text-parchment-500">
          {[...siteNav.slice(0, 6), ...legalNav].map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ember-400">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

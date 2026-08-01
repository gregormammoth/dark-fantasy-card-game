import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'url(/world/world-map.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          filter: 'saturate(0.75) brightness(0.45)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(11,8,7,.88)_70%)]" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-28">
        <p className="mb-4 font-cinzel text-xs tracking-[0.42em] text-ember-500">
          DARK FANTASY DECKBUILDER
        </p>
        <h1 className="max-w-3xl font-cinzel text-5xl leading-tight tracking-[0.08em] text-parchment-100 sm:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-parchment-400">
          Escape Hollowfort Prison. Build your deck across fighter, rogue, wizard, and survivor —
          then burn through enemies one card at a time.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/play"
            className="rounded-md border border-ember-400/60 bg-[linear-gradient(180deg,rgba(224,181,82,.22),rgba(90,40,18,.35))] px-6 py-3 font-cinzel text-sm tracking-[0.2em] text-parchment-100 transition hover:brightness-110"
          >
            PLAY NOW
          </Link>
          <Link
            href="/lore"
            className="rounded-md border border-[rgba(201,162,74,.28)] px-6 py-3 font-cinzel text-sm tracking-[0.2em] text-parchment-400 transition hover:border-ember-500/50 hover:text-parchment-200"
          >
            READ THE LORE
          </Link>
        </div>
      </div>
    </section>
  );
}

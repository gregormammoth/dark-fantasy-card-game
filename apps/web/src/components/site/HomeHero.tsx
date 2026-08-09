'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { siteConfig } from '@/lib/site';

export function HomeHero() {
  const imageRef = useRef<HTMLDivElement>(null);

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    const el = imageRef.current;
    if (!el) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `scale(1.06) translate(${x * -18}px, ${y * -18}px)`;
  }

  function handleLeave() {
    const el = imageRef.current;
    if (!el) return;
    el.style.transform = 'scale(1.06) translate(0, 0)';
  }

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex min-h-[92vh] items-center overflow-hidden"
    >
      <div
        ref={imageRef}
        className="absolute inset-[-4%] h-[108%] w-[108%] bg-cover bg-center transition-transform duration-200 ease-out"
        style={{
          backgroundImage: 'url(/world/world-map.png)',
          filter: 'saturate(0.8) brightness(0.55)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,.35)_0%,rgba(10,8,7,.15)_35%,rgba(10,8,7,.85)_88%,#0b0908_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,7,.85)_0%,rgba(10,8,7,.15)_45%,transparent_70%)]" />
      <div className="pointer-events-none absolute top-[8%] right-[6%] h-[420px] w-[420px] animate-[glow_6s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.22),transparent_70%)] blur-[10px]" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 lg:px-10">
        <div className="flex max-w-[660px] flex-col gap-[22px]">
          <p className="animate-[floatUp_.7s_ease-out_both] text-xs tracking-[0.34em] text-ember-400">
            DARK FANTASY DECKBUILDER
          </p>
          <h1 className="animate-[floatUp_.8s_.08s_ease-out_both] font-cinzel text-[56px] leading-[0.98] font-bold tracking-[0.02em] text-[#f3e6d6] [text-shadow:0_12px_50px_rgba(0,0,0,.6)] sm:text-[72px] lg:text-[88px]">
            {siteConfig.name.toUpperCase()}
          </h1>
          <p className="animate-[floatUp_.8s_.16s_ease-out_both] text-lg leading-relaxed text-[#cabfae]">
            Escape Hollowfort Prison. Build your deck across warrior, rogue, wizard, survivor, and seeker —
            then burn through enemies one card at a time.
          </p>
          <div className="mt-2 flex flex-wrap gap-4 animate-[floatUp_.8s_.24s_ease-out_both]">
            <Link
              href="/play"
              className="rounded-[10px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[30px] py-4 font-cinzel text-[13px] tracking-[0.14em] text-[#1a1208] shadow-[0_18px_40px_-14px_rgba(201,162,74,.55)] transition hover:brightness-110 hover:-translate-y-px"
            >
              PLAY NOW
            </Link>
            <Link
              href="/lore"
              className="rounded-[10px] border border-[rgba(201,162,74,.4)] px-[30px] py-4 font-cinzel text-[13px] tracking-[0.14em] text-[#e8ddcf] transition hover:border-ember-400 hover:text-[#f3e2d6]"
            >
              READ THE LORE
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[30px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-60">
        <span className="text-[10px] tracking-[0.3em] text-[#c7bba9]">SCROLL</span>
        <div className="h-9 w-px bg-[linear-gradient(180deg,#e0b552,transparent)]" />
      </div>
    </section>
  );
}

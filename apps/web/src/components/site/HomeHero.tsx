'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { siteConfig } from '@/lib/site';

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 13) % 100,
  size: 2 + (i % 4) * 0.75,
  duration: 9 + (i % 8),
  delay: (i * 0.73) % 12,
  drift: ((i * 17) % 121) - 60,
}));

export function HomeHero() {
  const { t } = useTranslation();
  const imageRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const rafRef = useRef(0);

  function applyTransform() {
    rafRef.current = 0;
    const el = imageRef.current;
    if (!el) {
      return;
    }
    const { x, y } = mouseRef.current;
    const s = Math.min(scrollRef.current, window.innerHeight) * -1;
    el.style.transform = `translate(${x * -38}px, ${y * -26 + s * 0.28}px) scale(1.08)`;
  }

  function schedule() {
    if (rafRef.current) {
      return;
    }
    rafRef.current = requestAnimationFrame(applyTransform);
  }

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
      schedule();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
    schedule();
  }

  function handleLeave() {
    mouseRef.current = { x: 0, y: 0 };
    schedule();
  }

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div
        ref={imageRef}
        className="absolute inset-[-10%] h-[120%] w-[120%] bg-cover bg-center"
        style={{
          backgroundImage: 'url(/world/world-map.png)',
          filter: 'saturate(0.8) brightness(0.55)',
          willChange: 'transform',
          transform: 'scale(1.08)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,.35)_0%,rgba(10,8,7,.1)_35%,rgba(10,8,7,.88)_88%,#0b0908_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,7,.85)_0%,rgba(10,8,7,.12)_45%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute top-[8%] right-[6%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(201,162,74,.22),transparent_70%)] blur-[10px]"
        style={{ animation: 'glow 6s ease-in-out infinite, drift 10s ease-in-out infinite' }}
      />

      {EMBERS.map((ember, index) => (
        <div
          key={index}
          className="pointer-events-none absolute z-[2] rounded-full"
          style={{
            left: `${ember.left}%`,
            bottom: '-4%',
            width: ember.size,
            height: ember.size,
            background: 'radial-gradient(circle,#f6d691,rgba(224,181,82,0))',
            boxShadow: '0 0 6px rgba(240,201,121,.85)',
            ['--drift']: `${ember.drift}px`,
            animation: `emberRise ${ember.duration}s linear ${ember.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      <div className="relative z-[3] mx-auto w-full max-w-[1400px] px-6 lg:px-10">
        <div className="flex max-w-[660px] flex-col gap-[22px]">
          <p className="animate-[floatUp_.7s_ease-out_both] text-xs tracking-[0.34em] text-ember-400">
            {t('site.hero.eyebrow')}
          </p>
          <h1
            className="font-cinzel text-[56px] leading-[0.98] font-bold tracking-[0.02em] text-[#f3e6d6] sm:text-[72px] lg:text-[88px]"
            style={{ animation: 'floatUp .8s .08s ease-out both, titleGlow 5s ease-in-out 1s infinite' }}
          >
            {siteConfig.name.toUpperCase()}
          </h1>
          <p className="animate-[floatUp_.8s_.16s_ease-out_both] text-lg leading-relaxed text-[#cabfae]">
            {t('site.hero.subtitle')}
          </p>
          <div className="mt-2 flex flex-wrap gap-4 animate-[floatUp_.8s_.24s_ease-out_both]">
            <Link
              href="/play"
              className="rounded-[10px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[30px] py-4 font-cinzel text-[13px] tracking-[0.14em] text-[#1a1208] shadow-[0_18px_40px_-14px_rgba(201,162,74,.55)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-[1.08] hover:shadow-[0_22px_46px_-12px_rgba(201,162,74,.7)]"
            >
              {t('site.hero.play')}
            </Link>
            <Link
              href="/lore"
              className="rounded-[10px] border border-[rgba(201,162,74,.4)] px-[30px] py-4 font-cinzel text-[13px] tracking-[0.14em] text-[#e8ddcf] transition-[border-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-ember-400 hover:text-[#f3e2d6]"
            >
              {t('site.hero.lore')}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[30px] left-1/2 z-[3] flex -translate-x-1/2 animate-[drift_3.2s_ease-in-out_infinite] flex-col items-center gap-2 opacity-60">
        <span className="text-[10px] tracking-[0.3em] text-[#c7bba9]">{t('site.hero.scroll')}</span>
        <div className="h-9 w-px bg-[linear-gradient(180deg,#e0b552,transparent)]" />
      </div>
    </section>
  );
}

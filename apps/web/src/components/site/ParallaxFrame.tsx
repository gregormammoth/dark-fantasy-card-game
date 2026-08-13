'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function ParallaxFrame({
  multiplier,
  className,
  children,
}: {
  multiplier: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let raf = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * multiplier;
      el.style.transform = `translateY(${offset}px)`;
    };
    const onScroll = () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [multiplier]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

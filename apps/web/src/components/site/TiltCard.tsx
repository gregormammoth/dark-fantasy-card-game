'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function TiltCard({
  href,
  glow,
  borderColor,
  children,
}: {
  href: string;
  glow: string;
  borderColor: string;
  children: ReactNode;
}) {
  function handleMove(event: React.MouseEvent<HTMLAnchorElement>) {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateY(-6px) scale(1.015)`;
    el.style.boxShadow = `0 34px 64px -22px ${glow}`;
  }

  function handleLeave(event: React.MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.style.transform =
      'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    event.currentTarget.style.boxShadow = 'none';
  }

  return (
    <Link
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="block overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#161110,#100c0b)]"
      style={{
        border: `1px solid ${borderColor}`,
        transform: 'perspective(900px)',
        transition: 'transform .15s ease-out, box-shadow .25s ease',
      }}
    >
      {children}
    </Link>
  );
}

'use client';

const MOTES = [
  { left: '12%', delay: '0s', duration: '9s', size: 3, drift: '-18px' },
  { left: '28%', delay: '1.6s', duration: '11s', size: 2, drift: '22px' },
  { left: '47%', delay: '0.8s', duration: '8s', size: 4, drift: '-8px' },
  { left: '63%', delay: '2.4s', duration: '12s', size: 2, drift: '16px' },
  { left: '81%', delay: '1.1s', duration: '10s', size: 3, drift: '-24px' },
];

export function PortraitBackdrop({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, #1a1520 0%, #0c0a10 48%, #06050a 100%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-[-8%] h-[118%] w-[78%] -translate-x-1/2"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 55%, #fff1c8) 0%, color-mix(in srgb, ${accent} 28%, #d4b07a) 28%, color-mix(in srgb, ${accent} 10%, transparent) 72%, transparent 100%)`,
          clipPath: 'polygon(32% 0, 68% 0, 96% 100%, 4% 100%)',
          opacity: 0.55,
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute left-1/2 top-[8%] h-[70%] w-[62%] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, color-mix(in srgb, ${accent} 48%, #ffe9b8) 0%, color-mix(in srgb, ${accent} 18%, transparent) 42%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-8%] left-1/2 h-[42%] w-[88%] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, color-mix(in srgb, ${accent} 40%, #f0d090) 0%, transparent 68%)`,
        }}
      />
      {MOTES.map((mote) => (
        <span
          key={`${mote.left}-${mote.delay}`}
          className="absolute bottom-[-8%] rounded-full"
          style={{
            left: mote.left,
            width: mote.size,
            height: mote.size,
            background: `radial-gradient(circle, color-mix(in srgb, ${accent} 80%, white), transparent 70%)`,
            boxShadow: `0 0 8px color-mix(in srgb, ${accent} 70%, white)`,
            animation: `emberRise ${mote.duration} linear ${mote.delay} infinite`,
            ['--drift' as string]: mote.drift,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 48px rgba(5,4,8,.55), inset 0 -28px 40px rgba(5,4,8,.4)',
        }}
      />
    </div>
  );
}

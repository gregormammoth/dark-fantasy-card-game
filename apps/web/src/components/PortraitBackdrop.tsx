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
          background: [
            `radial-gradient(ellipse 90% 70% at 50% 6%, color-mix(in srgb, ${accent} 38%, white) 0%, transparent 58%)`,
            `radial-gradient(ellipse 85% 60% at 50% 108%, color-mix(in srgb, ${accent} 62%, #1a1208) 0%, transparent 64%)`,
            `linear-gradient(165deg, color-mix(in srgb, ${accent} 26%, #f8f2e8), color-mix(in srgb, ${accent} 54%, #d7c9b4))`,
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-[-45%] opacity-[0.28]"
        style={{
          background: `conic-gradient(from 210deg, transparent 0deg, color-mix(in srgb, ${accent} 70%, white) 50deg, transparent 110deg, color-mix(in srgb, ${accent} 45%, transparent) 180deg, transparent 260deg)`,
          animation: 'portraitSheen 22s linear infinite',
        }}
      />
      <div
        className="absolute top-[-18%] left-1/2 h-[62%] w-[88%] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 58%, white), transparent 70%)`,
          animation: 'glow 6.5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-28%] left-[6%] h-[58%] w-[86%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 42%, transparent), transparent 72%)`,
          animation: 'drift 8.5s ease-in-out infinite',
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
          boxShadow: `inset 0 0 42px color-mix(in srgb, ${accent} 32%, transparent), inset 0 -36px 54px color-mix(in srgb, ${accent} 28%, #1a1208)`,
        }}
      />
    </div>
  );
}

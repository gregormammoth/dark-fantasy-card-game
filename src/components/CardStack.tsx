interface CardStackProps {
  count: number;
  side: 'enemy' | 'player';
  burningTopCount?: number;
}

export function CardStack({ count, side, burningTopCount = 0 }: CardStackProps) {
  const enemy = side === 'enemy';
  const width = enemy ? 116 : 88;
  const height = enemy ? 158 : 120;
  const accent = enemy ? '#d6443a' : '#c9a24a';
  const visualCount = count + burningTopCount;

  if (visualCount === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-[9px] border border-dashed text-[11px] tracking-[.14em] text-[#5a5147]"
        style={{
          width,
          height,
          borderColor: 'rgba(201,162,74,.25)',
        }}
      >
        EMPTY
      </div>
    );
  }

  const cards = Array.from({ length: visualCount }, (_, index) => {
    const burning = index >= count;
    return (
      <div
        key={burning ? `burn-${index}` : index}
        className={`absolute flex items-center justify-center overflow-hidden rounded-[9px] ${burning ? 'animate-burnaway' : ''}`}
        style={{
          left: index * 0.7,
          bottom: index * 3.4,
          width,
          height,
          zIndex: burning ? 400 + index : index,
          background: enemy
            ? 'linear-gradient(150deg,#2b1311 0%,#180b0a 100%)'
            : 'linear-gradient(150deg,#282011 0%,#151009 100%)',
          border: `1px solid ${enemy ? 'rgba(214,68,58,.4)' : 'rgba(201,162,74,.38)'}`,
          boxShadow: burning
            ? '0 0 18px -4px rgba(224,90,26,.6), 0 5px 12px -8px #000'
            : '0 5px 12px -8px #000, inset 0 1px 0 rgba(255,255,255,.04)',
          transform: `rotate(${(index % 2 ? 1 : -1) * 0.7}deg)`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            border: `1px solid ${accent}88`,
            transform: 'rotate(45deg)',
            opacity: burning ? 1 : 0.8,
            boxShadow: burning
              ? `inset 0 0 16px -2px ${accent}, 0 0 12px ${accent}`
              : `inset 0 0 12px -3px ${accent}`,
          }}
        />
        {burning && (
          <div
            className="animate-flareup absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 105%, rgba(255,180,70,.85), rgba(224,90,26,.5) 45%, transparent 72%)',
            }}
          />
        )}
      </div>
    );
  });

  return (
    <div
      className="relative"
      style={{
        width: width + visualCount * 0.7 + 6,
        height: height + visualCount * 3.4 + 6,
      }}
    >
      {cards}
    </div>
  );
}

interface CardStackProps {
  count: number;
  side: 'enemy' | 'player';
  burningIndices?: Set<number>;
}

export function CardStack({ count, side, burningIndices }: CardStackProps) {
  const enemy = side === 'enemy';
  const width = enemy ? 116 : 88;
  const height = enemy ? 158 : 120;
  const accent = enemy ? '#d6443a' : '#c9a24a';

  if (count === 0) {
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

  const cards = Array.from({ length: count }, (_, index) => {
    const burning = burningIndices?.has(index) ?? false;
    return (
      <div
        key={index}
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
          boxShadow: '0 5px 12px -8px #000, inset 0 1px 0 rgba(255,255,255,.04)',
          transform: `rotate(${(index % 2 ? 1 : -1) * 0.7}deg)`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            border: `1px solid ${accent}88`,
            transform: 'rotate(45deg)',
            opacity: 0.8,
            boxShadow: `inset 0 0 12px -3px ${accent}`,
          }}
        />
        {burning && (
          <div
            className="animate-flareup absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 105%, rgba(255,180,70,.75), rgba(224,90,26,.4) 45%, transparent 72%)',
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
        width: width + count * 0.7 + 6,
        height: height + count * 3.4 + 6,
      }}
    >
      {cards}
    </div>
  );
}

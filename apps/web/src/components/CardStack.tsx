export type StackSpendMode = 'burn' | 'draw';

interface CardStackProps {
  count: number;
  side: 'enemy' | 'player';
  spendingIndices?: Set<number>;
  spendMode?: StackSpendMode;
}

const BURN_MS = 820;
const DRAW_MS = 700;

export { BURN_MS, DRAW_MS };

function StackCard({
  index,
  side,
  spending,
  spendMode,
  width,
  height,
  accent,
}: {
  index: number;
  side: 'enemy' | 'player';
  spending: boolean;
  spendMode: StackSpendMode;
  width: number;
  height: number;
  accent: string;
}) {
  const enemy = side === 'enemy';
  const rot = (index % 2 ? 1 : -1) * 0.7;
  const isBurn = spendMode === 'burn';

  return (
    <div
      className="absolute"
      style={{
        left: index * 0.7,
        bottom: index * 3.4,
        width,
        height,
        zIndex: spending ? 400 + index : index,
      }}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-[9px] ${
          spending ? (isBurn ? 'animate-burnaway' : 'animate-drawaway') : ''
        }`}
        style={{
          ['--card-rot' as string]: `${rot}deg`,
          transform: spending ? undefined : `rotate(${rot}deg)`,
          background: enemy
            ? 'linear-gradient(150deg,#2b1311 0%,#180b0a 100%)'
            : 'linear-gradient(150deg,#282011 0%,#151009 100%)',
          border: `1px solid ${enemy ? 'rgba(214,68,58,.4)' : 'rgba(201,162,74,.38)'}`,
          boxShadow: spending
            ? undefined
            : '0 5px 12px -8px #000, inset 0 1px 0 rgba(255,255,255,.04)',
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
        {spending && isBurn && (
          <div
            className="animate-flareup pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 105%, rgba(255,180,70,.75), rgba(224,90,26,.4) 45%, transparent 72%)',
            }}
          />
        )}
        {spending && !isBurn && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(224,181,82,.35), transparent 65%)',
            }}
          />
        )}
      </div>
    </div>
  );
}

export function CardStack({
  count,
  side,
  spendingIndices,
  spendMode = 'burn',
}: CardStackProps) {
  const enemy = side === 'enemy';
  const width = enemy ? 116 : 88;
  const height = enemy ? 158 : 120;

  const spendSet = spendingIndices ?? new Set<number>();
  const displayCount =
    spendSet.size > 0 ? Math.max(count, ...spendSet) + 1 : count;

  if (displayCount === 0) {
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

  const cards = Array.from({ length: displayCount }, (_, index) => {
    const isPersisted = index < count;
    const isSpending = spendSet.has(index);
    if (!isPersisted && !isSpending) {
      return null;
    }

    return (
      <StackCard
        key={isSpending ? `spend-${spendMode}-${index}` : index}
        index={index}
        side={side}
        spending={isSpending}
        spendMode={spendMode}
        width={width}
        height={height}
        accent={enemy ? '#d6443a' : '#c9a24a'}
      />
    );
  });

  return (
    <div
      className="relative overflow-visible"
      style={{
        width: width + displayCount * 0.7 + 6,
        height: height + displayCount * 3.4 + 6,
      }}
    >
      {cards}
    </div>
  );
}

export function buildSpendIndices(currentCount: number, cardsSpent: number): Set<number> {
  const indices = new Set<number>();
  for (let k = 1; k <= cardsSpent; k += 1) {
    indices.add(currentCount + k - 1);
  }
  return indices;
}

export const buildBurnIndices = buildSpendIndices;

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
}

export function StatBar({ label, current, max, color }: StatBarProps) {
  const percent = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-stone-400">{label}</span>
        <span className="font-mono text-stone-200">
          {current}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-900">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface CombatantPanelProps {
  name: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  barrier?: number;
  deckCount: number;
  handCount?: number;
  poison?: { damagePerTurn: number; remainingTurns: number } | null;
  align?: 'left' | 'right';
}

export function CombatantPanel({
  name,
  health,
  maxHealth,
  shield,
  maxShield,
  barrier,
  deckCount,
  handCount,
  poison,
  align = 'left',
}: CombatantPanelProps) {
  return (
    <div className={`flex flex-col gap-3 ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <h2 className="text-lg font-bold tracking-wide text-stone-200">{name}</h2>
      <div className="w-64">
        <StatBar label="Health (cards)" current={health} max={maxHealth} color="bg-red-700" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-md border border-stone-800 bg-stone-900/60 px-3 py-1 font-mono text-stone-300">
          Deck {deckCount}
          {handCount !== undefined ? ` · Hand ${handCount}` : ''}
        </span>
        <span className="rounded-md border border-blue-900/50 bg-blue-950/40 px-3 py-1 font-mono text-blue-200">
          🛡 {shield}/{maxShield}
        </span>
        {barrier !== undefined && barrier > 0 && (
          <span className="rounded-md border border-violet-900/50 bg-violet-950/40 px-3 py-1 font-mono text-violet-200">
            ✦ {barrier}
          </span>
        )}
        {poison && (
          <span className="rounded-md border border-green-900/50 bg-green-950/40 px-3 py-1 font-mono text-green-300">
            ☠ {poison.damagePerTurn}/turn ({poison.remainingTurns})
          </span>
        )}
      </div>
    </div>
  );
}

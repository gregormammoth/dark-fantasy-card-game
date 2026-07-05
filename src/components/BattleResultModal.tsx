import { motion } from 'framer-motion';
import type { BattleLogEntry } from '@/types/log';
import type { BattleStats } from '@/types/battle';

const logColors: Record<BattleLogEntry['kind'], string> = {
  system: '#8a7f72',
  draw: '#8a7f72',
  combo: '#c9a24a',
  play: '#c9a24a',
  damage: '#c56a5f',
  shield: '#5b86c4',
  barrier: '#9a7ae0',
  poison: '#6fae5a',
  heal: '#c9a24a',
  victory: '#7ecb6a',
  defeat: '#e0524a',
};

interface BattleResultModalProps {
  victory: boolean;
  enemyName: string;
  stats: BattleStats;
  logEntries: BattleLogEntry[];
  onFightAgain: () => void;
}

export function BattleResultModal({
  victory,
  enemyName,
  stats,
  logEntries,
  onFightAgain,
}: BattleResultModalProps) {
  const accent = victory ? '#e0b552' : '#e0524a';
  const glow = victory ? 'rgba(224,181,82,.28)' : 'rgba(224,82,74,.3)';
  const xp = victory
    ? stats.cardsBurnedToEnemy * 12 + 60
    : stats.cardsBurnedToEnemy * 6;
  const subtitle = victory
    ? `${enemyName} has been vanquished.`
    : `You have fallen to ${enemyName}.`;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-[6px]"
      style={{
        background: 'radial-gradient(700px 500px at 50% 40%, rgba(10,7,6,.72), rgba(6,4,4,.92))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-[560px] overflow-hidden rounded-[18px] border border-[rgba(201,162,74,.28)] bg-gradient-to-b from-[#161110] to-[#0d0a09]"
        style={{ boxShadow: `0 50px 120px -30px #000, 0 0 90px -20px ${glow}` }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <div
          className="border-b border-[rgba(201,162,74,.14)] px-[30px] pt-[30px] pb-[22px] text-center"
          style={{
            background: `radial-gradient(360px 160px at 50% -20%, ${glow}, transparent 70%)`,
          }}
        >
          <span className="text-[11px] tracking-[.4em] text-[#8a7f72]">BATTLE OVER</span>
          <div
            className="my-1.5 font-cinzel text-[52px] tracking-[.14em]"
            style={{ color: accent, textShadow: `0 0 34px ${glow}` }}
          >
            {victory ? 'VICTORY' : 'DEFEAT'}
          </div>
          <span className="text-sm text-[#b7ab9c]">{subtitle}</span>
        </div>

        <div className="grid grid-cols-4 gap-px bg-[rgba(201,162,74,.12)]">
          <StatCell label="TURNS" value={stats.turnCount} color="#e8ddcf" />
          <StatCell label="CARDS BURNED" value={stats.cardsBurnedToEnemy} color="#f0b3aa" />
          <StatCell label="CARDS LOST" value={stats.cardsLostByPlayer} color="#e0b552" />
          <StatCell label="XP" value={`+${xp}`} color="#7ecb6a" />
        </div>

        <div className="px-6 pt-[18px] pb-1.5">
          <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">COMBAT LOG</span>
          <div className="mt-3 flex max-h-[172px] flex-col gap-2 overflow-y-auto pr-1.5">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2.5 text-xs leading-snug text-[#b7ab9c]"
              >
                <span
                  className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ background: logColors[entry.kind] }}
                />
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-6 pt-[18px] pb-6">
          <button
            type="button"
            onClick={onFightAgain}
            className="flex-1 cursor-pointer rounded-[10px] border px-[13px] py-[13px] font-cinzel text-sm tracking-[.14em] text-[#f3e2d6] transition-[filter] hover:brightness-[1.2]"
            style={{
              borderColor: accent,
              background: 'linear-gradient(180deg, rgba(224,82,74,.18), rgba(90,23,19,.25))',
            }}
          >
            FIGHT AGAIN
          </button>
          <button
            type="button"
            disabled
            className="min-w-[130px] cursor-not-allowed rounded-[10px] border border-[rgba(201,162,74,.3)] bg-transparent px-[13px] py-[13px] font-cinzel text-sm tracking-[.14em] text-[#5a5147] opacity-60"
          >
            TO MAP
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-[#100c0b] px-2.5 py-4 text-center">
      <div className="font-cinzel text-[26px]" style={{ color }}>
        {value}
      </div>
      <div className="mt-[3px] text-[9px] tracking-[.16em] text-[#8a7f72]">{label}</div>
    </div>
  );
}

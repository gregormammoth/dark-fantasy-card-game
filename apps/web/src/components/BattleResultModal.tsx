'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { CardClass } from '@dark-fantasy/shared/types/card';
import type { BattleLogEntry } from '@dark-fantasy/shared/types/log';
import type { BattleStats } from '@dark-fantasy/shared/types/battle';
import { useAudio } from '@/audio/useAudio';
import { classThemes, getClassLabel } from '@/lib/cardTheme';
import { useTranslation } from '@/i18n/useTranslation';
import { PLAYER_CLASSES } from '@/data/playerProgress';

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
  xpGained: Record<CardClass, number>;
  totalXpGained: number;
  onReturnToExploration: () => void;
  onResumeFromSave?: () => void;
  onStartOver?: () => void;
  canResumeFromSave?: boolean;
}

export function BattleResultModal({
  victory,
  enemyName,
  stats,
  logEntries,
  xpGained,
  totalXpGained,
  onReturnToExploration,
  onResumeFromSave,
  onStartOver,
  canResumeFromSave = false,
}: BattleResultModalProps) {
  const { t } = useTranslation();
  const { play } = useAudio();
  const accent = victory ? '#e0b552' : '#e0524a';
  const glow = victory ? 'rgba(224,181,82,.28)' : 'rgba(224,82,74,.3)';
  const subtitle = victory
    ? t('battle.enemyVanquished', { enemy: enemyName })
    : t('battle.youHaveFallen', { enemy: enemyName });
  const classGains = PLAYER_CLASSES.filter((classId) => xpGained[classId] > 0).map(
    (classId) => ({
      classId,
      amount: xpGained[classId],
      label: getClassLabel(classId, t),
      color: classThemes[classId].accent,
    }),
  );
  const showGameOverChoices = !victory && onResumeFromSave && onStartOver;

  useEffect(() => {
    play('modal_open');
    play(victory ? 'victory_reveal' : 'defeat_reveal');
  }, [play, victory]);

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
          <span className="text-[11px] tracking-[.4em] text-[#8a7f72]">
            {showGameOverChoices ? t('battle.gameOver') : t('battle.battleOver')}
          </span>
          <div
            className="my-1.5 font-cinzel text-[52px] tracking-[.14em]"
            style={{ color: accent, textShadow: `0 0 34px ${glow}` }}
          >
            {victory ? t('battle.victory') : t('battle.defeat')}
          </div>
          <span className="text-sm text-[#b7ab9c]">{subtitle}</span>
          {showGameOverChoices && (
            <p className="mx-auto mt-3 max-w-[380px] text-[12px] leading-relaxed text-[#8a7f72]">
              {t('battle.defeatHint')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-px bg-[rgba(201,162,74,.12)]">
          <StatCell label={t('battle.turns')} value={stats.turnCount} color="#e8ddcf" />
          <StatCell label={t('battle.cardsBurned')} value={stats.cardsBurnedToEnemy} color="#f0b3aa" />
          <StatCell label={t('battle.cardsLost')} value={stats.cardsLostByPlayer} color="#e0b552" />
          <StatCell label={t('battle.xp')} value={`+${totalXpGained}`} color="#7ecb6a" />
        </div>

        {classGains.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 border-b border-[rgba(201,162,74,.12)] px-6 py-3 text-[11px]">
            {classGains.map((gain) => (
              <span key={gain.classId} style={{ color: gain.color }}>
                {gain.label} +{gain.amount}
              </span>
            ))}
          </div>
        )}

        <div className="px-6 pt-[18px] pb-1.5">
          <span className="text-[10px] tracking-[.24em] text-[#c9a24a]">{t('battle.combatLog')}</span>
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

        <div className="flex flex-col gap-2.5 px-6 pt-[18px] pb-6 sm:flex-row">
          {showGameOverChoices ? (
            <>
              <button
                type="button"
                disabled={!canResumeFromSave}
                onClick={onResumeFromSave}
                className="flex-1 cursor-pointer rounded-[10px] border border-[rgba(201,162,74,.45)] bg-[linear-gradient(180deg,rgba(201,162,74,.14),rgba(40,28,18,.28))] px-[13px] py-[13px] font-cinzel text-sm tracking-[.1em] text-[#e0b552] transition-[filter] hover:brightness-[1.15] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('battle.loadSave')}
              </button>
              <button
                type="button"
                onClick={onStartOver}
                className="flex-1 cursor-pointer rounded-[10px] border border-[rgba(224,82,74,.5)] bg-[linear-gradient(180deg,rgba(224,82,74,.16),rgba(60,18,14,.3))] px-[13px] py-[13px] font-cinzel text-sm tracking-[.1em] text-[#ffd9d2] transition-[filter] hover:brightness-[1.15]"
              >
                {t('battle.newRun')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onReturnToExploration}
              className="flex-1 cursor-pointer rounded-[10px] border border-[rgba(201,162,74,.45)] bg-[linear-gradient(180deg,rgba(201,162,74,.14),rgba(40,28,18,.28))] px-[13px] py-[13px] font-cinzel text-sm tracking-[.14em] text-[#e0b552] transition-[filter] hover:brightness-[1.15]"
            >
              {t('battle.toPrison')}
            </button>
          )}
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

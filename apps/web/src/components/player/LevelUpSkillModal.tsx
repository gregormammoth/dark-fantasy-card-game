'use client';

import type { PlayerSkillId, PlayerSkills } from '@dark-fantasy/shared/types/progression';
import { PLAYER_SKILL_CEILING, PLAYER_SKILL_IDS } from '@dark-fantasy/shared/types/progression';
import { canChooseSkill } from '@dark-fantasy/game-engine';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';

interface LevelUpSkillModalProps {
  progression: PlayerProgression;
  availablePoints: number;
  onChoose: (skillId: PlayerSkillId) => void;
  onCancel: () => void;
}

const SKILL_LABEL_KEYS: Record<PlayerSkillId, MessageKey> = {
  maxShield: 'player.skill.maxShield',
  maxCombo: 'player.skill.maxCombo',
  maxMana: 'player.skill.maxMana',
  maxDeck: 'player.skill.maxDeck',
  drawPerTurn: 'player.skill.drawPerTurn',
};

export function LevelUpSkillModal({
  progression,
  availablePoints,
  onChoose,
  onCancel,
}: LevelUpSkillModalProps) {
  const { t } = useTranslation();
  const skills = progression.skills;

  return (
    <div className="fixed inset-0 z-50 flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.7)] backdrop-blur-[2px]">
      <div className="w-[420px] animate-[modalIn_.18s_ease-out] rounded-[14px] border border-[rgba(201,162,74,.45)] bg-[linear-gradient(180deg,#181211,#100c0b)] px-7 py-[26px] shadow-[0_40px_90px_-20px_#000]">
        <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">{t('levelUpModal.title')}</div>
        <div className="mt-1.5 font-cinzel text-[20px] text-[#e0b552]">
          {t('levelUpModal.headline')}
        </div>
        <p className="mt-2 text-[13px] text-[#b7ab9c]">{t('levelUpModal.body')}</p>
        <div className="mt-3 flex justify-between text-[12px] text-[#8a7f72]">
          <span>{t('levelUpModal.pointsLabel')}</span>
          <span className="text-[#e0b552]">{availablePoints}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {PLAYER_SKILL_IDS.map((skillId) => {
            const current = skills[skillId as keyof PlayerSkills];
            const ceiling = PLAYER_SKILL_CEILING[skillId];
            const choosable = canChooseSkill(progression, skillId);
            const atCap = current >= ceiling;
            return (
              <button
                key={skillId}
                type="button"
                disabled={!choosable}
                onClick={() => onChoose(skillId)}
                className="flex items-center justify-between rounded-[10px] border px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: choosable ? 'rgba(224,181,82,.45)' : 'rgba(201,162,74,.18)',
                  background: choosable ? 'rgba(224,181,82,.08)' : 'rgba(0,0,0,.2)',
                }}
              >
                <span>
                  <span className="block font-cinzel text-[13px] text-[#f0dfcb]">
                    {t(SKILL_LABEL_KEYS[skillId])}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8a7f72]">
                    {atCap
                      ? t('levelUpModal.atCap')
                      : t('levelUpModal.nextValue', { current, next: current + 1 })}
                  </span>
                </span>
                {!atCap && (
                  <span className="font-cinzel text-[12px] tracking-[.08em] text-[#e0b552]">
                    {t('levelUpModal.choose')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 w-full rounded-[10px] border border-[rgba(201,162,74,.24)] bg-transparent py-[11px] font-cinzel text-[13px] tracking-[.08em] text-[#8a7f72] transition hover:text-[#e8ddcf]"
        >
          {t('levelUpModal.later')}
        </button>
      </div>
    </div>
  );
}

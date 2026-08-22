'use client';

import { useState, type FormEvent } from 'react';
import { PLAYER_GENDER_PORTRAITS } from '@dark-fantasy/content/portraits';
import type { PlayerGender, PlayerProfile } from '@dark-fantasy/shared/types/player';
import {
  TutorialBody,
  TutorialModal,
  TutorialTip,
  TutorialTitle,
} from '@/components/tour/TutorialModal';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { useTranslation } from '@/i18n/useTranslation';
import { isCharacterCoachSeen, markCharacterCoachSeen } from '@/lib/tour';

interface CharacterCreationScreenProps {
  onCreate: (name: string, gender: PlayerGender) => Promise<PlayerProfile>;
}

export function CharacterCreationScreen({ onCreate }: CharacterCreationScreenProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<PlayerGender>('woman');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(() => !isCharacterCoachSeen());
  const trimmedName = name.trim();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmedName.length < 2 || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmedName, gender);
    } catch {
      setError(t('character.apiError'));
      setSubmitting(false);
    }
  }

  function closeTutorial() {
    markCharacterCoachSeen();
    setTutorialOpen(false);
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#090706] px-5 py-10 text-[#e8ddcf]">
      <TutorialModal
        open={tutorialOpen}
        onClose={closeTutorial}
        eyebrow={t('welcomeTutorial.eyebrow')}
        backLabel={t('explorationTutorial.back')}
        nextLabel={t('explorationTutorial.next')}
        doneLabel={t('common.begin')}
        stepLabel={(step) => t('explorationTutorial.stepLabel', { step })}
        steps={[
          <>
            <TutorialTitle>{t('welcomeTutorial.title')}</TutorialTitle>
            <TutorialBody>{t('welcomeTutorial.body')}</TutorialBody>
            <TutorialTip label={t('welcomeTutorial.tip')}>{t('welcomeTutorial.tipBody')}</TutorialTip>
          </>,
        ]}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(122,90,190,.13),transparent_42%),radial-gradient(circle_at_50%_85%,rgba(201,162,74,.08),transparent_34%)]" />
      <form
        onSubmit={submit}
        className="relative grid w-full max-w-[980px] overflow-hidden rounded-xl border border-[rgba(201,162,74,.28)] bg-[linear-gradient(145deg,rgba(25,20,17,.98),rgba(10,8,7,.99))] shadow-[0_30px_90px_rgba(0,0,0,.65)] md:grid-cols-[1.05fr_.95fr]"
      >
        <section className="relative min-h-[560px] overflow-hidden border-b border-[rgba(201,162,74,.2)] md:border-r md:border-b-0">
          <CharacterPortrait
            src={PLAYER_GENDER_PORTRAITS[gender].warrior}
            className="absolute inset-0 h-full w-full"
            classId="warrior"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(243,234,220,.35)_82%,rgba(243,234,220,.82)_100%)]" />
        </section>

        <section className="flex flex-col justify-center px-7 py-10 sm:px-10">
          <div className="text-[10px] tracking-[.34em] text-[#c9a24a]">{t('character.registry')}</div>
          <h1 className="mt-3 font-cinzel text-3xl text-[#f0dfcb]">{t('character.title')}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#8f8377]">{t('character.subtitle')}</p>

          <label className="mt-9 text-[10px] tracking-[.2em] text-[#a99a8b]" htmlFor="player-name">
            {t('character.nameLabel')}
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 24))}
            placeholder={t('character.namePlaceholder')}
            autoComplete="off"
            autoFocus
            className="mt-2 h-12 rounded-md border border-[rgba(201,162,74,.3)] bg-[#0d0a09] px-4 font-cinzel text-base text-[#f0dfcb] outline-none transition placeholder:font-sans placeholder:text-[#554d46] focus:border-[#c9a24a]"
          />
          <div className="mt-1 text-right text-[9px] text-[#625850]">{trimmedName.length}/24</div>

          <div className="mt-6 text-[10px] tracking-[.2em] text-[#a99a8b]">{t('character.characterLabel')}</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(['woman', 'man'] as const).map((option) => {
              const selected = gender === option;
              return (
                <div
                  key={option}
                  className="flex h-14 items-center gap-3 rounded-md border px-3"
                  style={{
                    borderColor: selected ? '#c9a24a' : 'rgba(201,162,74,.2)',
                    background: selected ? 'rgba(201,162,74,.1)' : '#0d0a09',
                  }}
                >
                  <CharacterPortrait
                    src={PLAYER_GENDER_PORTRAITS[option].warrior}
                    className="h-10 w-8 overflow-hidden rounded-sm"
                    classId="warrior"
                    onPreview={() => setGender(option)}
                  />
                  <button
                    type="button"
                    onClick={() => setGender(option)}
                    className="flex-1 text-left font-cinzel text-xs tracking-[.12em] text-[#ddd0c1] uppercase"
                  >
                    {option === 'woman' ? t('character.genderWoman') : t('character.genderMan')}
                  </button>
                </div>
              );
            })}
          </div>

          {error && <div className="mt-5 text-sm text-[#e0524a]">{error}</div>}

          <button
            type="submit"
            disabled={trimmedName.length < 2 || submitting}
            className="mt-8 h-12 rounded-md border border-[#c9a24a] bg-[linear-gradient(180deg,#d7b65b,#a77e2f)] font-cinzel text-sm tracking-[.16em] text-[#1b1207] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {submitting ? t('character.submitting') : t('character.submit')}
          </button>
        </section>
      </form>
    </main>
  );
}

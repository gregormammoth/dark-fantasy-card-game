import { useEffect, useMemo, useRef, useState } from 'react';
import type { CardClass, CardDefinition } from '@dark-fantasy/shared/types/card';
import type { ExplorationContext, RunQuest } from '@dark-fantasy/shared/types/exploration';
import type {
  PlayerLoadout,
  PlayerProgression,
  PlayerSkillId,
} from '@dark-fantasy/shared/types/progression';
import { PLAYER_SKILL_IDS } from '@dark-fantasy/shared/types/progression';
import type { PlayerProfile } from '@dark-fantasy/shared/types/player';
import {
  chooseSkill,
  getAvailableSkillPoints,
  getClassLevel,
  getClassXp,
  getDeckCap,
  getPlayerLevel,
  getPlayerLevelProgress,
  getPlayerPortraitForDeck,
  getTotalXp,
  getXpIntoLevel,
  unlockImprovedCard,
  replaceDeckCard,
  toggleDeckCard,
} from '@dark-fantasy/game-engine';
import { ClaimBadge } from '@/components/ClaimBadge';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { DeckSwapPicker } from '@/components/player/DeckSwapPicker';
import { UnlockCardModal } from '@/components/player/UnlockCardModal';
import { LevelUpSkillModal } from '@/components/player/LevelUpSkillModal';
import { TourModal } from '@/components/tour/TourModal';
import { useTranslation } from '@/i18n/useTranslation';
import { isStepSeen, markStepSeen } from '@/lib/tour';
import type { MessageKey } from '@/i18n/types';
import { classThemes, getCardEffectSummary, getCardType, getClassLabel } from '@/lib/cardTheme';
import { getCardDescription, getCardName, getQuestDescription, getQuestName } from '@/lib/contentLabels';
import {
  getQuestSteps,
  listQuestItems,
  questLocationLabel,
  questStepsLabel,
  type QuestItemView,
} from '@/lib/questUi';
import {
  LEVEL_COST,
  PLAYER_CLASSES,
  XP_PER_LEVEL,
  cardStatusFor,
  classSpendableLevels,
  getCardsForClass,
  getPlayerCardDefinitions,
  type CardStatus,
} from '@/data/playerProgress';

type TabId = 'character' | 'quests' | 'inventory';
type QuestFilter = 'all' | 'active' | 'completed';
type ItemFilter = 'all' | 'key' | 'ingredient';

const SKILL_LABEL_KEYS: Record<PlayerSkillId, MessageKey> = {
  maxShield: 'player.skill.maxShield',
  maxCombo: 'player.skill.maxCombo',
  maxMana: 'player.skill.maxMana',
  maxDeck: 'player.skill.maxDeck',
  drawPerTurn: 'player.skill.drawPerTurn',
};

const SKILL_DESC_KEYS: Record<PlayerSkillId, MessageKey> = {
  maxShield: 'player.skillDesc.maxShield',
  maxCombo: 'player.skillDesc.maxCombo',
  maxMana: 'player.skillDesc.maxMana',
  maxDeck: 'player.skillDesc.maxDeck',
  drawPerTurn: 'player.skillDesc.drawPerTurn',
};

interface PlayerScreenProps {
  progression: PlayerProgression;
  loadout: PlayerLoadout;
  profile: PlayerProfile;
  onLoadoutChange: (loadout: PlayerLoadout) => void;
  onProgressionChange: (progression: PlayerProgression) => void;
  exploration?: ExplorationContext | null;
  onBack: () => void;
  backLabel?: string;
}

function typeLabel(definition: CardDefinition, t: ReturnType<typeof useTranslation>['t']): string {
  return getCardType(definition) === 'defense' ? t('cardType.defense') : t('cardType.attack');
}

function typeColor(definition: CardDefinition): string {
  return getCardType(definition) === 'defense' ? '#5a9ec9' : '#d6443a';
}

function statusCopy(
  status: CardStatus,
  inDeck: boolean,
  availableLevels: number,
  accent: string,
  improved: boolean,
  t: ReturnType<typeof useTranslation>['t'],
): { label: string; color: string } {
  if (status === 'unlocked') {
    return {
      label: inDeck ? t('player.inDeck') : t('player.unlockedAdd'),
      color: '#7fb08a',
    };
  }
  if (status === 'available') {
    return {
      label: t('player.unlockCost', { cost: LEVEL_COST }),
      color: accent,
    };
  }
  if (improved) {
    return {
      label: t('player.needsLevel', { cost: LEVEL_COST, available: availableLevels }),
      color: '#8a7f72',
    };
  }
  return { label: t('player.lockedStatus'), color: '#8a7f72' };
}

export function PlayerScreen({
  progression,
  loadout,
  profile,
  onLoadoutChange,
  onProgressionChange,
  exploration = null,
  onBack,
  backLabel = '← World Map',
}: PlayerScreenProps) {
  const { t } = useTranslation();
  const allCards = useMemo(() => getPlayerCardDefinitions(), []);
  const [activeTab, setActiveTab] = useState<TabId>('character');
  const [selectedClassId, setSelectedClassId] = useState<CardClass>('warrior');
  const [selectedCardByClass, setSelectedCardByClass] = useState<Partial<Record<CardClass, string>>>(
    {},
  );
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);
  const [swapIntent, setSwapIntent] = useState<{ mode: 'add' | 'unlock'; cardId: string } | null>(
    null,
  );
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [questFilter, setQuestFilter] = useState<QuestFilter>('all');
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [progressionTutorialOpen, setProgressionTutorialOpen] = useState(
    () => activeTab === 'character' && !isStepSeen(profile.playerId, 'progression'),
  );

  useEffect(() => {
    if (activeTab !== 'character' || isStepSeen(profile.playerId, 'progression')) {
      return;
    }
    setProgressionTutorialOpen(true);
  }, [activeTab, profile.playerId]);

  function closeProgressionTutorial() {
    markStepSeen(profile.playerId, 'progression');
    setProgressionTutorialOpen(false);
  }

  const availableSkillPoints = getAvailableSkillPoints(progression);
  const playerLevel = getPlayerLevel(progression);
  const playerLevelProgress = getPlayerLevelProgress(progression);
  const deckCap = getDeckCap(progression);

  const didAutoOpenLevelUp = useRef(false);
  useEffect(() => {
    if (!didAutoOpenLevelUp.current && availableSkillPoints > 0) {
      didAutoOpenLevelUp.current = true;
      setLevelUpOpen(true);
    }
  }, [availableSkillPoints]);

  const cardById = useMemo(() => {
    const map: Record<string, CardDefinition> = {};
    for (const card of allCards) {
      map[card.id] = card;
    }
    return map;
  }, [allCards]);

  const cardClassById = useMemo(() => {
    const map: Record<string, CardClass> = {};
    for (const card of allCards) {
      if (card.class) {
        map[card.id] = card.class;
      }
    }
    return map;
  }, [allCards]);

  const deck = loadout.deckCardIds;
  const playerPortrait = getPlayerPortraitForDeck(deck, profile.gender);

  const deckByClass = Object.fromEntries(PLAYER_CLASSES.map((id) => [id, 0])) as Record<
    CardClass,
    number
  >;
  for (const id of deck) {
    const classId = cardClassById[id];
    if (classId) {
      deckByClass[classId] += 1;
    }
  }

  const buildParts = PLAYER_CLASSES.filter((id) => deckByClass[id] > 0)
    .sort((a, b) => deckByClass[b] - deckByClass[a])
    .slice(0, 2)
    .map((id) => getClassLabel(id, t));
  const totalXp = getTotalXp(progression);
  const playerLevelPct = Math.max(
    0,
    Math.min(100, Math.round((playerLevelProgress.current / playerLevelProgress.total) * 100)),
  );

  const selectedTheme = classThemes[selectedClassId];
  const selectedAvailableLevels = classSpendableLevels(progression, loadout, selectedClassId);
  const selectedCards = getCardsForClass(selectedClassId);
  const selectedCardId =
    selectedCardByClass[selectedClassId] &&
    selectedCards.some((card) => card.id === selectedCardByClass[selectedClassId])
      ? selectedCardByClass[selectedClassId]!
      : selectedCards[0]?.id ?? null;
  const activeCard = selectedCardId ? cardById[selectedCardId] : null;
  const activeStatus = activeCard
    ? cardStatusFor(activeCard, progression, loadout)
    : 'locked-xp';
  const activeInDeck = activeCard ? deck.includes(activeCard.id) : false;
  const activeStatusView = activeCard
    ? statusCopy(
        activeStatus,
        activeInDeck,
        selectedAvailableLevels,
        selectedTheme.accent,
        Boolean(activeCard.improved),
        t,
      )
    : { label: '', color: '#8a7f72' };
  const activeCardDescription = activeCard
    ? getCardDescription(activeCard.id, t, activeCard.description).trim() ||
      getCardEffectSummary(activeCard, t)
    : '';
  const activeCardName = activeCard
    ? getCardName(activeCard.id, t, activeCard.name)
    : '';

  const confirmCard = confirmCardId ? cardById[confirmCardId] : null;
  const confirmClassId = confirmCardId ? cardClassById[confirmCardId] : null;
  const confirmAvailable =
    confirmClassId != null
      ? classSpendableLevels(progression, loadout, confirmClassId)
      : 0;

  const quests = exploration?.quests ?? [];
  const filteredQuests = quests.filter(
    (quest) => questFilter === 'all' || quest.status === questFilter,
  );
  const activeQuestId =
    selectedQuestId && filteredQuests.some((quest) => quest.id === selectedQuestId)
      ? selectedQuestId
      : filteredQuests[0]?.id ?? null;
  const selectedQuest =
    quests.find((quest) => quest.id === activeQuestId) ?? filteredQuests[0] ?? null;

  const items = listQuestItems(exploration, t);
  const filteredItems = items.filter(
    (item) => itemFilter === 'all' || item.category === itemFilter,
  );
  const activeItemId =
    selectedItemId && filteredItems.some((item) => item.id === selectedItemId)
      ? selectedItemId
      : filteredItems[0]?.id ?? null;
  const selectedItem = items.find((item) => item.id === activeItemId) ?? null;

  const topLabel =
    activeTab === 'quests'
      ? t('player.questLog')
      : activeTab === 'inventory'
        ? t('player.inventory')
        : t('player.character');

  function onCardAction(card: CardDefinition) {
    if (!card.class) {
      return;
    }
    const status = cardStatusFor(card, progression, loadout);
    if (status === 'unlocked') {
      if (deck.includes(card.id)) {
        return;
      }
      if (deck.length < deckCap) {
        onLoadoutChange(toggleDeckCard(loadout, card.id, progression));
        return;
      }
      setSwapIntent({ mode: 'add', cardId: card.id });
      return;
    }
    if (status === 'available') {
      setConfirmCardId(card.id);
    }
  }

  function confirmUnlock() {
    if (!confirmCardId) {
      return;
    }
    if (deck.length < deckCap) {
      const next = unlockImprovedCard(progression, loadout, confirmCardId);
      if (next) {
        onLoadoutChange(next);
      }
      setConfirmCardId(null);
      return;
    }
    setSwapIntent({ mode: 'unlock', cardId: confirmCardId });
    setConfirmCardId(null);
  }

  function confirmSwap(removeCardId: string) {
    if (!swapIntent) {
      return;
    }
    const next =
      swapIntent.mode === 'unlock'
        ? unlockImprovedCard(progression, loadout, swapIntent.cardId, removeCardId)
        : replaceDeckCard(loadout, swapIntent.cardId, removeCardId);
    if (next) {
      onLoadoutChange(next);
    }
    setSwapIntent(null);
  }

  function onChooseSkill(skillId: PlayerSkillId) {
    const next = chooseSkill(progression, skillId);
    if (!next) {
      return;
    }
    onProgressionChange(next);
    if (getAvailableSkillPoints(next) <= 0) {
      setLevelUpOpen(false);
    }
  }

  function actionButton(card: CardDefinition) {
    const status = cardStatusFor(card, progression, loadout);
    const inDeck = deck.includes(card.id);
    if (status === 'unlocked') {
      if (inDeck) {
        return {
          label: t('player.inDeck'),
          border: 'rgba(201,162,74,.2)',
          bg: 'transparent',
          color: '#6a6058',
          enabled: false,
        };
      }
      return {
        label: deck.length < deckCap ? t('player.addToDeck') : t('player.swapIntoDeck'),
        border: `${selectedTheme.accent}66`,
        bg: `${selectedTheme.accent}22`,
        color: selectedTheme.accent,
        enabled: true,
      };
    }
    if (status === 'available') {
      return {
        label: t('player.unlockLevel', { cost: LEVEL_COST }),
        border: `${selectedTheme.accent}88`,
        bg: `${selectedTheme.accent}28`,
        color: selectedTheme.accent,
        enabled: true,
      };
    }
    return {
      label: t('common.locked'),
      border: 'rgba(201,162,74,.2)',
      bg: 'transparent',
      color: '#6a6058',
      enabled: false,
    };
  }

  const detailBtn = activeCard ? actionButton(activeCard) : null;

  return (
    <div className="player-screen-bg flex min-h-[100dvh] justify-center px-6 py-8 sm:px-10">
      <TourModal
        open={progressionTutorialOpen}
        onClose={closeProgressionTutorial}
        eyebrow={t('progressionTutorial.eyebrow')}
        title={t('progressionTutorial.title')}
        body={t('progressionTutorial.body')}
        hints={[
          {
            title: t('progressionTutorial.hintATitle'),
            body: t('progressionTutorial.hintABody'),
          },
          {
            title: t('progressionTutorial.hintBTitle'),
            body: t('progressionTutorial.hintBBody'),
          },
          {
            title: t('progressionTutorial.hintCTitle'),
            body: t('progressionTutorial.hintCBody'),
          },
        ]}
        confirmLabel={t('common.gotIt')}
      />
      <div className="flex w-full max-w-[1400px] flex-col gap-5">
        <div className="flex items-center justify-between pr-12">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[#7d93ad] transition hover:text-[#f5dfa0]"
          >
            {backLabel}
          </button>
          <span
            className="font-cinzel text-[15px] tracking-[.35em]"
            style={{ background: 'linear-gradient(180deg,#f5dfa0,#c9a24a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
          >
            {topLabel}
          </span>
          <span className="text-[9px] tracking-[.2em] text-[#5c7086]">{t('player.ledger')}</span>
        </div>

        <div className="flex gap-2.5">
          {(
            [
              ['character', t('player.character')],
              ['quests', t('player.questLog')],
              ['inventory', t('player.inventory')],
            ] as const
          ).map(([id, label]) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="rounded-t-[8px] border px-7 py-[13px] font-cinzel text-[12px] tracking-[.16em] transition hover:-translate-y-[3px]"
                style={{
                  color: selected ? '#fff6e0' : '#7d93ad',
                  background: selected ? 'linear-gradient(160deg,rgba(232,200,116,.3),rgba(232,200,116,.06))' : 'linear-gradient(160deg,rgba(255,255,255,.03),rgba(0,0,0,.2))',
                  borderColor: selected ? 'rgba(232,200,116,.6)' : 'rgba(232,200,116,.15)',
                  borderBottomColor: 'rgba(232,200,116,.6)',
                  boxShadow: selected ? '0 1px 0 rgba(255,255,255,.1) inset,0 -8px 22px -10px rgba(232,200,116,.5)' : '0 1px 0 rgba(255,255,255,.02) inset',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === 'character' && (
          <>
            <div
              className="-mt-px relative flex gap-[26px] rounded-[12px] px-7 py-6"
              style={{
                border: '1px solid rgba(232,200,116,.35)',
                background: 'linear-gradient(160deg,#142238,#0a1120)',
                boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 34px 70px -26px rgba(0,0,0,.9),0 0 50px -20px rgba(74,192,255,.35)',
              }}
            >
              <span className="pointer-events-none absolute -left-[5px] -top-[5px] h-[10px] w-[10px] rotate-45 bg-[#e8c874] shadow-[0_0_8px_#e8c874]" />
              <span className="pointer-events-none absolute -right-[5px] -top-[5px] h-[10px] w-[10px] rotate-45 bg-[#e8c874] shadow-[0_0_8px_#e8c874]" />
              <span className="pointer-events-none absolute -bottom-[5px] -left-[5px] h-[10px] w-[10px] rotate-45 bg-[#e8c874] shadow-[0_0_8px_#e8c874]" />
              <span className="pointer-events-none absolute -bottom-[5px] -right-[5px] h-[10px] w-[10px] rotate-45 bg-[#e8c874] shadow-[0_0_8px_#e8c874]" />

              <div className="relative shrink-0">
                <div
                  className="pointer-events-none absolute inset-[-10px] rounded-full border border-dashed border-[rgba(232,200,116,.4)]"
                  style={{ animation: 'ringSpin 18s linear infinite' }}
                />
                <div
                  className="relative h-[186px] w-[150px] overflow-hidden rounded-[10px]"
                  style={{
                    background: 'radial-gradient(120% 140% at 50% 15%,#3a6a94 0%,#1a3a5c 45%,#0c1830 100%)',
                    boxShadow: '0 24px 44px -16px rgba(0,0,0,.85),0 0 34px -6px rgba(74,192,255,.45),0 0 0 1px rgba(232,200,116,.5),inset 0 0 0 1px rgba(255,255,255,.1)',
                  }}
                >
                  <CharacterPortrait src={playerPortrait} className="h-full w-full" />
                  <div className="pointer-events-none absolute inset-0 rounded-[10px] border border-[rgba(232,200,116,.6)] shadow-[inset_0_0_30px_rgba(0,0,0,.5)]" />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-3">
                <div>
                  <div
                    className="font-cinzel text-[26px]"
                    style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
                  >
                    {profile.name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-[#7d93ad]">{t('player.escapedFrom')}</div>
                </div>
                <div className="flex flex-wrap gap-3.5">
                  {[
                    { label: t('player.build'), value: buildParts.length ? buildParts.join(' / ') : t('player.unaligned'), color: '#eef3f8' },
                    { label: t('player.level'), value: playerLevel, color: '#e8c874' },
                    { label: t('player.totalXp'), value: totalXp.toLocaleString(), color: '#eef3f8' },
                    { label: t('player.deck'), value: t('player.deckCount', { count: deck.length, cap: deckCap }), color: '#eef3f8' },
                  ].map((chip) => (
                    <div
                      key={chip.label}
                      className="rounded-[8px] border px-4 py-2"
                      style={{
                        background: 'linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.25))',
                        borderColor: 'rgba(232,200,116,.25)',
                        boxShadow: '0 1px 0 rgba(255,255,255,.05) inset',
                      }}
                    >
                      <div className="text-[8px] tracking-[.18em] text-[#5c7086]">{chip.label}</div>
                      <div className="mt-[3px] font-cinzel text-[14px]" style={{ color: chip.color }}>
                        {chip.value}
                        {chip.label === t('player.level') && availableSkillPoints > 0 && (
                          <ClaimBadge kind="level" count={availableSkillPoints} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-[10px] tracking-[.14em] text-[#5c7086]">
                    <span>{t('player.level')} {playerLevel}</span>
                    <span>{t('player.playerLevelBar', { current: playerLevelProgress.current, total: playerLevelProgress.total })}</span>
                  </div>
                  <div
                    className="relative h-2 overflow-hidden rounded-[4px]"
                    style={{ background: 'rgba(0,0,0,.5)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.6)' }}
                  >
                    <div
                      className="relative h-full overflow-hidden"
                      style={{ width: `${playerLevelPct}%`, background: 'linear-gradient(90deg,#c9922e,#e8c874)' }}
                    >
                      <div
                        className="absolute inset-0 w-[40%]"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)', animation: 'shimmerSweep 2.4s ease-in-out infinite' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center gap-2.5 rounded-[10px] px-[22px] py-3.5 transition hover:-translate-y-[2px]"
              style={{
                border: `1px solid ${availableSkillPoints > 0 ? 'rgba(232,200,116,.7)' : 'rgba(232,200,116,.25)'}`,
                background: 'linear-gradient(160deg,#142238,#0a1120)',
                boxShadow: availableSkillPoints > 0
                  ? '0 1px 0 rgba(255,255,255,.08) inset,0 16px 30px -18px rgba(0,0,0,.8),0 0 26px -6px rgba(232,200,116,.65)'
                  : '0 1px 0 rgba(255,255,255,.06) inset,0 16px 30px -18px rgba(0,0,0,.8)',
              }}
            >
              <span className="shrink-0 text-[9px] tracking-[.2em] text-[#5c7086]">{t('player.skills')}</span>
              <div className="flex flex-1 flex-wrap gap-2.5">
                {PLAYER_SKILL_IDS.map((skillId) => (
                  <span
                    key={skillId}
                    className="group relative flex items-center gap-[7px] rounded-[20px] border border-[rgba(74,192,255,.25)] bg-[rgba(74,192,255,.08)] px-3 py-1.5"
                  >
                    <span className="text-[11px] text-[#9db4cc]">{t(SKILL_LABEL_KEYS[skillId])}</span>
                    <span className="font-cinzel text-[12px] text-[#4ac0ff]">{progression.skills[skillId]}</span>
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 hidden w-max max-w-[240px] -translate-x-1/2 rounded-[6px] border border-[rgba(201,162,74,.4)] bg-[#0a1120] px-2.5 py-1.5 text-[11px] leading-snug text-[#d8cbb8] shadow-[0_12px_28px_-10px_#000] group-hover:block">
                      {t(SKILL_DESC_KEYS[skillId])}
                    </span>
                  </span>
                ))}
              </div>
              {availableSkillPoints > 0 && (
                <button
                  type="button"
                  onClick={() => setLevelUpOpen(true)}
                  className="shrink-0 rounded-[20px] px-3.5 py-[7px] font-cinzel text-[10px] tracking-[.1em] text-[#1a1208] transition"
                  style={{
                    background: 'linear-gradient(180deg,#f5dfa0,#c9922e)',
                    animation: 'pulseGlow 1.8s ease-in-out infinite',
                  }}
                >
                  +{availableSkillPoints} {t('player.chooseSkill')}
                </button>
              )}
            </div>

            <div className="flex gap-2.5">
              {PLAYER_CLASSES.map((classId) => {
                const theme = classThemes[classId];
                const earned = getClassXp(progression, classId);
                const level = getClassLevel(earned);
                const xpInto = getXpIntoLevel(earned);
                const unclaimedCount = classSpendableLevels(progression, loadout, classId);
                const selected = classId === selectedClassId;
                const xpPct = Math.max(0, Math.min(100, Math.round((xpInto / XP_PER_LEVEL) * 100)));
                return (
                  <button
                    key={classId}
                    type="button"
                    onClick={() => setSelectedClassId(classId)}
                    className="flex flex-1 flex-col gap-2.5 rounded-[10px] border p-4 text-left transition"
                    style={{
                      background: selected ? `linear-gradient(160deg,${theme.accent}22,${theme.accent}08)` : 'linear-gradient(160deg,#142238,#0a1120)',
                      borderColor: selected ? theme.accent : 'rgba(232,200,116,.18)',
                      boxShadow: selected
                        ? `0 1px 0 rgba(255,255,255,.1) inset,0 20px 36px -16px rgba(0,0,0,.9),0 0 20px -4px ${theme.accent}`
                        : '0 1px 0 rgba(255,255,255,.04) inset,0 12px 22px -14px rgba(0,0,0,.7)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(${theme.accent} ${xpPct}%, rgba(255,255,255,.08) 0)` }}
                      >
                        <div
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-cinzel text-[11px]"
                          style={{ background: '#0a1120', color: theme.accent }}
                        >
                          {level}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel text-[13px] leading-none tracking-wide" style={{ color: theme.accent }}>
                            {getClassLabel(classId, t)}
                          </span>
                          {unclaimedCount > 0 && (
                            <span
                              className="shrink-0 rounded-[3px] px-1.5 py-0.5 font-cinzel text-[9px]"
                              style={{ background: theme.accent, color: '#0a1120' }}
                            >
                              +{unclaimedCount}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#5c7086]">{xpInto}/{XP_PER_LEVEL} XP</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-start gap-4">
              <div
                className="min-w-0 flex-1 overflow-hidden rounded-[10px]"
                style={{ border: '1px solid rgba(232,200,116,.28)', background: 'linear-gradient(160deg,#142238,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.05) inset,0 28px 54px -24px rgba(0,0,0,.85)' }}
              >
                <div className="flex border-b border-[rgba(232,200,116,.28)] bg-[rgba(232,200,116,.06)] px-4 py-2.5">
                  <span className="w-12" />
                  <span className="flex-1 text-[10px] tracking-[.16em] text-[#7d93ad]">{t('common.name')}</span>
                  <span className="w-[90px] text-[10px] tracking-[.16em] text-[#7d93ad]">{t('player.typeHeader')}</span>
                  <span className="w-[150px] text-[10px] tracking-[.16em] text-[#7d93ad]">
                    {t('player.valueHeader')}
                  </span>
                  <span className="w-[150px] text-right text-[10px] tracking-[.16em] text-[#7d93ad]">
                    {t('player.statusHeader')}
                  </span>
                </div>
                {selectedCards.map((definition) => {
                  const status = cardStatusFor(definition, progression, loadout);
                  const inDeck = deck.includes(definition.id);
                  const selected = definition.id === selectedCardId;
                  const unlockable = status === 'available';
                  const locked = status === 'locked-xp';
                  const copy = statusCopy(
                    status,
                    inDeck,
                    selectedAvailableLevels,
                    selectedTheme.accent,
        Boolean(definition.improved),
        t,
      );
                  const imageSrc =
                    definition.image ??
                    (definition.class ? `/cards/${definition.id}.png` : undefined);
                  const thumbFilter = unlockable
                    ? 'grayscale(1) brightness(.68)'
                    : locked
                      ? 'grayscale(1) brightness(.55)'
                      : 'none';
                  const nameColor = unlockable
                    ? selectedTheme.accent
                    : locked
                      ? '#6a6058'
                      : selected
                        ? '#e0b552'
                        : '#f0dfcb';
                  const cardName = getCardName(definition.id, t, definition.name);
                  const description =
                    getCardDescription(definition.id, t, definition.description).trim() ||
                    getCardEffectSummary(definition, t);
                  return (
                    <button
                      key={definition.id}
                      type="button"
                      onClick={() =>
                        setSelectedCardByClass((current) => ({
                          ...current,
                          [selectedClassId]: definition.id,
                        }))
                      }
                      className={`group/cardrow relative flex w-full items-center border-b border-[rgba(232,200,116,.08)] px-4 py-2 text-left transition hover:translate-x-1 hover:bg-[rgba(74,192,255,.08)]${
                        unlockable ? ' card-unlockable' : ''
                      }`}
                      style={{
                        background: selected ? 'rgba(224,181,82,.12)' : undefined,
                        ['--unlock-accent' as string]: unlockable ? selectedTheme.accent : undefined,
                      }}
                    >
                      {description && (
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-[calc(100%+8px)] left-4 z-50 hidden w-max max-w-[280px] rounded-[6px] border border-[rgba(201,162,74,.4)] bg-[#161110] px-2.5 py-1.5 text-left shadow-[0_12px_28px_-10px_#000] group-hover/cardrow:block"
                        >
                          <span className="block font-cinzel text-[11px] leading-tight text-[#e0b552]">
                            {definition.improved ? '★ ' : ''}
                            {cardName}
                          </span>
                          <span className="mt-1 block text-[11px] leading-snug text-[#d8cbb8]">
                            {description}
                          </span>
                        </span>
                      )}
                      <span className="w-12 shrink-0">
                        <span
                          className="block h-[38px] w-[38px] overflow-hidden rounded"
                          style={
                            unlockable
                              ? { boxShadow: `0 0 0 2px ${selectedTheme.accent}88` }
                              : undefined
                          }
                        >
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt=""
                              className="h-full w-full object-cover"
                              style={{ filter: thumbFilter }}
                            />
                          ) : (
                            <span className="block h-full w-full bg-[#0c0908]" />
                          )}
                        </span>
                      </span>
                      <span
                        className="flex-1 pl-1.5 font-cinzel text-[13px]"
                        style={{ color: nameColor }}
                      >
                        {definition.improved ? '★ ' : ''}
                        {cardName}
                      </span>
                      <span
                        className="w-[90px] text-[10px] tracking-wide"
                        style={{ color: typeColor(definition) }}
                      >
                        {typeLabel(definition, t)}
                      </span>
                      <span className="w-[150px] text-[12px] text-[#a99c8d]">
                        {getCardEffectSummary(definition, t)}
                      </span>
                      <span
                        className="w-[150px] text-right text-[11px]"
                        style={{ color: copy.color }}
                      >
                        {copy.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeCard && detailBtn && (
                <div
                  className={`group/carddetail relative w-[300px] shrink-0 overflow-visible rounded-[10px]${
                    activeStatus === 'available' ? ' card-unlockable-panel' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(160deg,#152540,#0a1120)',
                    boxShadow: '0 1px 0 rgba(255,255,255,.05) inset,0 28px 54px -24px rgba(0,0,0,.85)',
                    border: `1px solid ${
                      activeStatus === 'available' ? selectedTheme.accent : `${selectedTheme.accent}55`
                    }`,
                    ['--unlock-accent' as string]:
                      activeStatus === 'available' ? selectedTheme.accent : undefined,
                  }}
                >
                  {activeCardDescription && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 hidden w-max max-w-[280px] -translate-x-1/2 rounded-[6px] border border-[rgba(201,162,74,.4)] bg-[#161110] px-2.5 py-1.5 text-left shadow-[0_12px_28px_-10px_#000] group-hover/carddetail:block"
                      >
                        <span className="block font-cinzel text-[11px] leading-tight text-[#e0b552]">
                          {activeCard.improved ? '★ ' : ''}
                          {activeCardName}
                        </span>
                        <span className="mt-1 block text-[11px] leading-snug text-[#d8cbb8]">
                          {activeCardDescription}
                        </span>
                      </span>
                  )}
                  <div className="relative h-[300px] overflow-hidden bg-[#0c0908]">
                    {(activeCard.image ??
                      (activeCard.class ? `/cards/${activeCard.id}.png` : undefined)) && (
                      <img
                        src={
                          activeCard.image ??
                          (activeCard.class ? `/cards/${activeCard.id}.png` : '')
                        }
                        alt=""
                        className="h-full w-full object-cover"
                        style={{
                          filter:
                            activeStatus === 'locked-xp'
                              ? 'grayscale(1) brightness(.55)'
                              : activeStatus === 'available'
                                ? 'grayscale(1) brightness(.68)'
                                : 'none',
                        }}
                      />
                    )}
                    <span
                      className="absolute left-2 top-2 rounded-[3px] px-1.5 py-0.5 text-[9px] tracking-wider text-white"
                      style={{ background: typeColor(activeCard) }}
                    >
                      {typeLabel(activeCard, t)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 px-[18px] py-4">
                    <div className="font-cinzel text-[17px] text-[#f0dfcb]">
                      {activeCard.improved ? '★ ' : ''}
                      {activeCardName}
                    </div>
                    {activeCard.improved && (
                      <div className="text-[10px] tracking-[.16em] text-[#c9a24a]">{t('player.improvedCost')}</div>
                    )}
                    <div className="text-[12px] text-[#a99c8d]">
                      {getCardEffectSummary(activeCard, t)}
                    </div>
                    <div className="my-0.5 h-px bg-[rgba(201,162,74,.18)]" />
                    <div
                      className="text-[11px] tracking-wide"
                      style={{ color: activeStatusView.color }}
                    >
                      {activeStatusView.label}
                    </div>
                    <button
                      type="button"
                      disabled={!detailBtn.enabled}
                      onClick={() => onCardAction(activeCard)}
                      className="mt-1.5 rounded-[5px] border px-[11px] py-[11px] font-cinzel text-[12px] tracking-wider transition enabled:hover:brightness-110 disabled:cursor-not-allowed"
                      style={{
                        borderColor: detailBtn.border,
                        background: detailBtn.bg,
                        color: detailBtn.color,
                      }}
                    >
                      {detailBtn.label}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className="rounded-[10px] px-[22px] py-[18px]"
              style={{ border: '1px solid rgba(232,200,116,.24)', background: 'linear-gradient(160deg,#142238,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.05) inset,0 22px 44px -22px rgba(0,0,0,.8)' }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-cinzel text-[14px] tracking-[.1em] text-[#eef3f8]">
                  {t('player.currentDeck')}
                </span>
                <span className="text-[12px] text-[#7d93ad]">
                  {t('player.currentDeckCount', { count: deck.length, cap: deckCap })}
                </span>
              </div>
              <div className="flex flex-col gap-[9px]">
                {PLAYER_CLASSES.map((classId) => {
                  const theme = classThemes[classId];
                  const count = deckByClass[classId];
                  const pct = deckCap > 0 ? Math.round((count / deckCap) * 100) : 0;
                  const glow = theme.accent + '80';
                  return (
                    <div key={classId} className="flex items-center gap-3">
                      <span
                        className="w-[70px] font-cinzel text-[12px]"
                        style={{ color: theme.accent, textShadow: `0 0 10px ${theme.accent}` }}
                      >
                        {getClassLabel(classId, t)}
                      </span>
                      <div
                        className="h-[13px] flex-1 overflow-hidden rounded-[7px]"
                        style={{ background: 'rgba(0,0,0,.55)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.03)' }}
                      >
                        <div
                          className="relative h-full overflow-hidden rounded-[7px]"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg,${theme.accent}bb,${theme.accent})`,
                            boxShadow: `0 0 16px ${glow},0 0 3px ${glow} inset`,
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.5),transparent 55%)' }} />
                          <div
                            className="absolute bottom-0 top-0 w-[35%]"
                            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent)', animation: 'shimmerSweep 2.8s ease-in-out infinite' }}
                          />
                        </div>
                      </div>
                      <span className="w-11 text-right font-cinzel text-[12px]" style={{ color: theme.accent }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'quests' && (
          <QuestsTab
            quests={filteredQuests}
            allQuests={quests}
            filter={questFilter}
            onFilter={setQuestFilter}
            selectedQuest={selectedQuest}
            onSelect={setSelectedQuestId}
            exploration={exploration}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            items={filteredItems}
            filter={itemFilter}
            onFilter={setItemFilter}
            selectedItem={selectedItem}
            onSelect={setSelectedItemId}
            allItems={items}
            portrait={playerPortrait}
            money={exploration?.money ?? 0}
          />
        )}
      </div>

      {swapIntent && (
        <DeckSwapPicker
          incomingName={
            getCardName(
              swapIntent.cardId,
              t,
              cardById[swapIntent.cardId]?.name ?? swapIntent.cardId,
            )
          }
          deckCards={deck
            .map((id) => cardById[id])
            .filter((card): card is CardDefinition => Boolean(card))}
          onPick={confirmSwap}
          onCancel={() => setSwapIntent(null)}
        />
      )}

      {confirmCard && confirmClassId && (
        <UnlockCardModal
          name={getCardName(confirmCard.id, t, confirmCard.name)}
          className={getClassLabel(confirmClassId, t)}
          color={classThemes[confirmClassId].accent}
          borderColor={`${classThemes[confirmClassId].accent}66`}
          costLevels={LEVEL_COST}
          availableLevels={confirmAvailable}
          afterLevels={Math.max(0, confirmAvailable - LEVEL_COST)}
          onConfirm={confirmUnlock}
          onCancel={() => setConfirmCardId(null)}
        />
      )}

      {levelUpOpen && availableSkillPoints > 0 && (
        <LevelUpSkillModal
          progression={progression}
          availablePoints={availableSkillPoints}
          onChoose={onChooseSkill}
          onCancel={() => setLevelUpOpen(false)}
        />
      )}
    </div>
  );
}

function QuestsTab({
  quests,
  allQuests,
  filter,
  onFilter,
  selectedQuest,
  onSelect,
  exploration,
}: {
  quests: RunQuest[];
  allQuests: RunQuest[];
  filter: QuestFilter;
  onFilter: (filter: QuestFilter) => void;
  selectedQuest: RunQuest | null;
  onSelect: (id: string) => void;
  exploration: ExplorationContext | null;
}) {
  const { t } = useTranslation();
  const steps = selectedQuest ? getQuestSteps(exploration, selectedQuest, t) : null;

  return (
    <div className="-mt-px flex flex-col gap-3.5">
      <div className="flex gap-2">
        {(
          [
            ['all', t('common.all')],
            ['active', t('exploration.active')],
            ['completed', t('common.completed')],
          ] as const
        ).map(([id, label]) => {
          const selected = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilter(id)}
              className="rounded border px-4 py-2 font-cinzel text-[11px] tracking-[.1em]"
              style={{
                color: selected ? '#f0dfcb' : '#8a7f72',
                background: selected ? 'rgba(224,181,82,.12)' : 'transparent',
                borderColor: selected ? 'rgba(224,181,82,.5)' : 'rgba(201,162,74,.2)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-4">
        <div className="w-[340px] shrink-0 overflow-hidden rounded-[10px]" style={{ border: '1px solid rgba(232,200,116,.24)', background: 'linear-gradient(160deg,#142238,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.05) inset,0 26px 50px -24px rgba(0,0,0,.85)' }}>
          {allQuests.length === 0 && (
            <p className="m-0 px-4 py-5 text-[12px] text-[#8a7f72]">{t('player.noQuestsYet')}</p>
          )}
          {quests.map((quest) => {
            const selected = quest.id === selectedQuest?.id;
            const questSteps = getQuestSteps(exploration, quest, t);
            const stepsText = questStepsLabel(questSteps, t);
            const statusLabel =
              quest.status === 'completed' ? t('common.completed') : t('common.inProgress');
            const dot = quest.status === 'completed' ? '#7fb08a' : '#e0b552';
            return (
              <button
                key={quest.id}
                type="button"
                onClick={() => onSelect(quest.id)}
                className="w-full border-b border-[rgba(201,162,74,.1)] px-4 py-3.5 text-left transition hover:bg-[rgba(224,181,82,.08)]"
                style={{
                  background: selected ? 'rgba(224,181,82,.12)' : 'transparent',
                  borderLeft: `3px solid ${selected ? '#e0b552' : 'transparent'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: dot }}
                  />
                  <span
                    className="font-cinzel text-[13px]"
                    style={{ color: selected ? '#e0b552' : '#f0dfcb' }}
                  >
                    {getQuestName(quest.id, t, quest.name)}
                  </span>
                </div>
                <div className="ml-[17px] mt-1 text-[10px] tracking-[.1em] text-[#8a7f72]">
                  {questLocationLabel(quest, t)} · {statusLabel}
                </div>
                {stepsText && (
                  <div className="ml-[17px] mt-1 text-[10px] tracking-[.1em] text-[#c9a24a]">
                    {stepsText}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="relative flex-1 rounded-[10px] px-[34px] py-[30px]"
          style={{ border: '1px solid rgba(232,200,116,.35)', background: 'linear-gradient(160deg,#152540,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -24px rgba(0,0,0,.9)' }}
        >
          {selectedQuest ? (
            <>
              <div className="text-[10px] tracking-[.2em] text-[#5c7086]">
                {questLocationLabel(selectedQuest, t)}
              </div>
              <div
                className="mt-1.5 font-cinzel text-[24px]"
                style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                {getQuestName(selectedQuest.id, t, selectedQuest.name)}
              </div>
              <div
                className="mt-2 font-cinzel text-[11px] tracking-[.12em]"
                style={{ color: selectedQuest.status === 'completed' ? '#5fd68a' : '#4ac0ff' }}
              >
                {selectedQuest.status === 'completed' ? t('common.completed') : t('common.inProgress')}
              </div>
              <div className="my-4 h-px bg-[rgba(232,200,116,.18)]" />
              <p className="m-0 text-[14px] leading-relaxed text-[#c2d0e0]">
                {getQuestDescription(selectedQuest.id, t, selectedQuest.description)}
              </p>
              {steps && steps.length > 0 && (
                <div className="mt-5 flex flex-col gap-[11px]">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <span
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] text-[11px]"
                        style={{
                          borderColor: step.done ? '#5fd68a' : '#8a94a6',
                          background: step.done ? 'rgba(95,214,138,.15)' : 'transparent',
                          color: step.done ? '#5fd68a' : '#8a94a6',
                          boxShadow: step.done ? '0 0 8px rgba(95,214,138,.5)' : 'none',
                        }}
                      >
                        {step.done ? '✓' : ''}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color: step.done ? '#6f8a7a' : '#c2d0e0',
                          textDecoration: step.done ? 'line-through' : 'none',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="m-0 text-[14px] text-[#7d93ad]">{t('player.noQuestSelected')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InventoryTab({
  items,
  filter,
  onFilter,
  selectedItem,
  onSelect,
  allItems,
  portrait,
  money,
}: {
  items: QuestItemView[];
  filter: ItemFilter;
  onFilter: (filter: ItemFilter) => void;
  selectedItem: QuestItemView | null;
  onSelect: (id: string) => void;
  allItems: QuestItemView[];
  portrait: string;
  money: number;
}) {
  const { t } = useTranslation();
  const keyring = allItems.find((item) => item.id === 'dining_keyring');
  const lavender = allItems.find((item) => item.id === 'dried_lavender');
  const mushroom = allItems.find((item) => item.id === 'lowcap_mushroom');

  return (
    <div className="-mt-px flex items-start gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 rounded-md border border-[rgba(201,162,74,.24)] bg-[rgba(0,0,0,.2)] px-4 py-3">
          <span className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.crowns')}</span>
          <span className="font-cinzel text-[18px] text-[#c9a24a]">
            {t('player.crownsCount', { count: money })}
          </span>
        </div>
        <div className="flex gap-2">
          {(
            [
              ['all', t('common.all')],
              ['key', t('player.keyItems')],
              ['ingredient', t('player.ingredients')],
            ] as const
          ).map(([id, label]) => {
            const selected = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFilter(id)}
                className="rounded border px-4 py-2 font-cinzel text-[11px] tracking-[.1em]"
                style={{
                  color: selected ? '#f0dfcb' : '#8a7f72',
                  background: selected ? 'rgba(224,181,82,.12)' : 'transparent',
                  borderColor: selected ? 'rgba(224,181,82,.5)' : 'rgba(201,162,74,.2)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div
          className="overflow-hidden rounded-[10px]"
          style={{ border: '1px solid rgba(232,200,116,.24)', background: 'linear-gradient(160deg,#142238,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.05) inset,0 26px 50px -24px rgba(0,0,0,.85)' }}
        >
          <div className="flex border-b border-[rgba(232,200,116,.28)] bg-[rgba(232,200,116,.06)] px-4 py-2.5">
            <span className="w-[46px]" />
            <span className="w-[180px] text-[10px] tracking-[.16em] text-[#7d93ad]">{t('common.name')}</span>
            <span className="flex-1 text-[10px] tracking-[.16em] text-[#7d93ad]">
              {t('common.description')}
            </span>
            <span className="w-[160px] text-right text-[10px] tracking-[.16em] text-[#7d93ad]">
              {t('player.questProgress')}
            </span>
          </div>
          {items.map((item) => {
            const selected = item.id === selectedItem?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center border-b border-[rgba(201,162,74,.08)] px-4 py-2.5 text-left transition hover:bg-[rgba(224,181,82,.1)]"
                style={{
                  background: selected ? 'rgba(224,181,82,.1)' : 'transparent',
                  opacity: item.obtained ? 1 : 0.55,
                }}
              >
                <span className="w-[46px] shrink-0">
                  <span className="relative block h-9 w-9 overflow-hidden rounded border border-dashed border-[rgba(201,162,74,.25)]">
                    {item.obtained ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                </span>
                <span
                  className="w-[180px] pl-1.5 font-cinzel text-[13px]"
                  style={{
                    color: !item.obtained ? '#6a6058' : selected ? '#e0b552' : '#f0dfcb',
                  }}
                >
                  {item.name}
                </span>
                <span className="flex-1 pr-4 text-[12px] leading-snug text-[#a99c8d]">
                  {item.description}
                </span>
                <span
                  className="w-[160px] text-right text-[11px]"
                  style={{ color: item.obtained ? '#e0b552' : '#6a6058' }}
                >
                  {item.obtained ? item.questName : t('player.notYetFound')}
                </span>
              </button>
            );
          })}
        </div>

        {selectedItem && (
          <div className="rounded-md border border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,#181211,#100c0b)] px-5 py-4">
            <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">{selectedItem.location}</div>
            <div className="mt-1 font-cinzel text-[18px] text-[#f0dfcb]">{selectedItem.name}</div>
            <div className="mt-1 text-[10px] tracking-[.14em] text-[#c9a24a]">{selectedItem.tag}</div>
            <p className="mt-3 mb-0 text-[13px] leading-relaxed text-[#b7ab9c]">
              {selectedItem.description}
            </p>
          </div>
        )}
      </div>

        <div
          className="w-[440px] shrink-0 overflow-hidden rounded-[10px]"
          style={{ border: '1px solid rgba(232,200,116,.28)', background: 'linear-gradient(160deg,#142238,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset,0 30px 60px -24px rgba(0,0,0,.9)' }}
        >
        <div className="flex items-center justify-center gap-3.5 px-[18px] py-5">
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const filled = index === 0 && keyring?.obtained;
              const selected = selectedItem?.id === 'dining_keyring' && filled;
              return (
                <button
                  key={`L${index}`}
                  type="button"
                  disabled={!filled}
                  onClick={() => filled && onSelect('dining_keyring')}
                  className="relative h-14 w-14 overflow-hidden rounded-[5px] bg-[#100c0b]"
                  style={{
                    border: selected
                      ? '1px solid #e0b552'
                      : filled
                        ? '1px solid rgba(201,162,74,.5)'
                        : '1px dashed rgba(201,162,74,.18)',
                    cursor: filled ? 'pointer' : 'default',
                  }}
                >
                  {filled && keyring ? (
                    <img src={keyring.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div
            className="relative h-[298px] w-[158px] overflow-hidden rounded-[10px]"
            style={{ background: 'radial-gradient(120% 130% at 50% 12%,#3a6a94 0%,#1a3a5c 45%,#0c1830 100%)', boxShadow: '0 26px 48px -18px rgba(0,0,0,.9),0 0 0 1px rgba(232,200,116,.5),inset 0 0 0 1px rgba(255,255,255,.1)' }}
          >
            <CharacterPortrait
              src={portrait}
              className="h-full w-full"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const item =
                index === 0 ? lavender : index === 1 ? mushroom : null;
              const filled = Boolean(item?.obtained);
              const selected = filled && selectedItem?.id === item?.id;
              return (
                <button
                  key={`R${index}`}
                  type="button"
                  disabled={!filled}
                  onClick={() => item?.obtained && onSelect(item.id)}
                  className="relative h-14 w-14 overflow-hidden rounded-[5px] bg-[#100c0b]"
                  style={{
                    border: selected
                      ? '1px solid #e0b552'
                      : filled
                        ? '1px solid rgba(201,162,74,.5)'
                        : '1px dashed rgba(201,162,74,.18)',
                    cursor: filled ? 'pointer' : 'default',
                  }}
                >
                  {filled && item ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

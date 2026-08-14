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
import { DeckSwapPicker } from '@/components/player/DeckSwapPicker';
import { UnlockCardModal } from '@/components/player/UnlockCardModal';
import { LevelUpSkillModal } from '@/components/player/LevelUpSkillModal';
import { CoachMark } from '@/components/tour/CoachMark';
import { useCoachStep } from '@/components/tour/useCoachStep';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';
import { classThemes, getCardEffectSummary, getCardType, getClassLabel } from '@/lib/cardTheme';
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
  const progressionCoach = useCoachStep(profile.playerId, 'progression', activeTab === 'character');
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
    <div className="flex min-h-[100dvh] justify-center px-6 py-8 text-[#e8ddcf] sm:px-10">
      {progressionCoach.show && (
        <CoachMark
          title={t('tour.progressionTitle')}
          body={t('tour.progressionBody')}
          placement="top"
          onDismiss={progressionCoach.dismiss}
        />
      )}
      <div className="flex w-full max-w-[1400px] flex-col gap-5">
        <div className="flex items-center justify-between pr-12">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[#8a7f72] transition hover:text-[#e0b552]"
          >
            {backLabel}
          </button>
          <span className="font-cinzel text-[16px] tracking-[.3em] text-[#b8917f]">{topLabel}</span>
          <span className="text-[10px] tracking-[.18em] text-[#8a7f72]">{t('player.ledger')}</span>
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
                className="rounded-t-[4px] border border-b-0 px-[22px] py-[11px] font-cinzel text-[12px] tracking-[.14em] transition"
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

        {activeTab === 'character' && (
          <>
            <div className="-mt-px flex gap-[22px] rounded-md border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#1a1512,#110d0b)] px-6 py-5">
              <div className="relative shrink-0">
                <div className="h-[130px] w-[104px] overflow-hidden rounded">
                  <img
                    src={playerPortrait}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded border border-[rgba(201,162,74,.5)]" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2.5">
                <div>
                  <div className="font-cinzel text-[22px] text-[#f0dfcb]">{profile.name}</div>
                  <div className="mt-0.5 text-[12px] italic text-[#8a7f72]">{t('player.escapedFrom')}</div>
                </div>
                <div className="flex flex-wrap gap-10">
                  <div>
                    <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.build')}</div>
                    <div className="mt-1 font-cinzel text-[14px] text-[#e8ddcf]">
                      {buildParts.length ? buildParts.join(' / ') : t('player.unaligned')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.level')}</div>
                    <div className="mt-1 flex items-center gap-2 font-cinzel text-[14px] leading-none text-[#c9a24a]">
                      {playerLevel}
                      {availableSkillPoints > 0 && (
                        <ClaimBadge kind="level" count={availableSkillPoints} />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.totalXp')}</div>
                    <div className="mt-1 font-cinzel text-[14px] text-[#e8ddcf]">
                      {totalXp.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.deck')}</div>
                    <div className="mt-1 font-cinzel text-[14px] text-[#e8ddcf]">
                      {t('player.deckCount', { count: deck.length, cap: deckCap })}
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-[9px] tracking-[.2em] text-[#8a7f72]">
                      {t('player.level')}
                    </span>
                    <span className="text-[11px] text-[#8a7f72]">
                      {t('player.playerLevelBar', {
                        current: playerLevelProgress.current,
                        total: playerLevelProgress.total,
                      })}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-[rgba(0,0,0,.4)]">
                    <div
                      className="h-full bg-[#c9a24a] transition-[width] duration-300"
                      style={{ width: `${playerLevelPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 rounded-[5px] border border-[rgba(201,162,74,.2)] bg-[rgba(0,0,0,.2)] px-4 py-3">
              <span className="text-[9px] tracking-[.2em] text-[#8a7f72]">{t('player.skills')}</span>
              <div className="flex flex-1 flex-wrap gap-2">
                {PLAYER_SKILL_IDS.map((skillId) => (
                  <span
                    key={skillId}
                    className="group relative rounded-[5px] border border-transparent px-2 py-1 text-[12px] text-[#e8ddcf] transition duration-150 hover:border-[rgba(224,181,82,.7)] hover:bg-[rgba(224,181,82,.14)]"
                  >
                    <span className="text-[#8a7f72]">{t(SKILL_LABEL_KEYS[skillId])}</span>
                    {' '}
                    <span className="font-cinzel text-[#c9a24a]">{progression.skills[skillId]}</span>
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 hidden w-max max-w-[240px] -translate-x-1/2 rounded-[6px] border border-[rgba(201,162,74,.4)] bg-[#161110] px-2.5 py-1.5 text-[11px] leading-snug text-[#d8cbb8] shadow-[0_12px_28px_-10px_#000] group-hover:block">
                      {t(SKILL_DESC_KEYS[skillId])}
                    </span>
                  </span>
                ))}
              </div>
              {availableSkillPoints > 0 && (
                <button
                  type="button"
                  onClick={() => setLevelUpOpen(true)}
                  className="claim-glow inline-flex items-center gap-1.5 rounded-[5px] border border-[rgba(224,181,82,.5)] bg-[rgba(224,181,82,.12)] px-3 py-1.5 font-cinzel text-[11px] leading-none tracking-[.12em] text-[#e0b552] transition hover:brightness-110"
                >
                  {t('player.chooseSkill')}
                  <ClaimBadge kind="level" count={availableSkillPoints} />
                </button>
              )}
            </div>

            <div className="mt-1 flex gap-2">
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
                    className="flex flex-1 flex-col gap-[7px] rounded-[5px] border px-4 py-3 text-left transition hover:brightness-110"
                    style={{
                      background: selected ? `${theme.accent}14` : 'rgba(0,0,0,.2)',
                      borderColor: selected ? theme.accent : 'rgba(201,162,74,.2)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-[7px]">
                        <span
                          className="font-cinzel text-[14px] leading-none tracking-wide"
                          style={{ color: theme.accent }}
                        >
                          {getClassLabel(classId, t)}
                        </span>
                        {unclaimedCount > 0 && (
                          <ClaimBadge kind="card" count={unclaimedCount} accent={theme.accent} />
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#8a7f72]">
                        {t('player.xpBar', { level, current: xpInto, total: XP_PER_LEVEL })}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-sm bg-[rgba(0,0,0,.4)]">
                      <div
                        className="h-full transition-[width] duration-300"
                        style={{ width: `${xpPct}%`, background: theme.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,#161110,#100c0b)]">
                <div className="flex border-b border-[rgba(201,162,74,.28)] bg-[rgba(201,162,74,.06)] px-4 py-2.5">
                  <span className="w-12" />
                  <span className="flex-1 text-[10px] tracking-[.16em] text-[#8a7f72]">{t('common.name')}</span>
                  <span className="w-[90px] text-[10px] tracking-[.16em] text-[#8a7f72]">{t('player.typeHeader')}</span>
                  <span className="w-[150px] text-[10px] tracking-[.16em] text-[#8a7f72]">
                    {t('player.valueHeader')}
                  </span>
                  <span className="w-[150px] text-right text-[10px] tracking-[.16em] text-[#8a7f72]">
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
                      className={`flex w-full items-center border-b border-[rgba(201,162,74,.08)] px-4 py-2 text-left transition hover:bg-[rgba(224,181,82,.1)]${
                        unlockable ? ' card-unlockable' : ''
                      }`}
                      style={{
                        background: selected ? 'rgba(224,181,82,.12)' : undefined,
                        ['--unlock-accent' as string]: unlockable ? selectedTheme.accent : undefined,
                      }}
                    >
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
                        {definition.name}
                      </span>
                      <span
                        className="w-[90px] text-[10px] tracking-wide"
                        style={{ color: typeColor(definition) }}
                      >
                        {typeLabel(definition, t)}
                      </span>
                      <span className="w-[150px] text-[12px] text-[#a99c8d]">
                        {getCardEffectSummary(definition)}
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
                  className={`w-[300px] shrink-0 overflow-hidden rounded-md bg-[linear-gradient(180deg,#181211,#100c0b)]${
                    activeStatus === 'available' ? ' card-unlockable-panel' : ''
                  }`}
                  style={{
                    border: `1px solid ${
                      activeStatus === 'available' ? selectedTheme.accent : `${selectedTheme.accent}55`
                    }`,
                    ['--unlock-accent' as string]:
                      activeStatus === 'available' ? selectedTheme.accent : undefined,
                  }}
                >
                  <div className="relative h-[300px] bg-[#0c0908]">
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
                      {activeCard.name}
                    </div>
                    {activeCard.improved && (
                      <div className="text-[10px] tracking-[.16em] text-[#c9a24a]">{t('player.improvedCost')}</div>
                    )}
                    <div className="text-[12px] text-[#a99c8d]">
                      {getCardEffectSummary(activeCard)}
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

            <div className="rounded-md border border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-[22px] py-[18px]">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="font-cinzel text-[14px] tracking-[.1em] text-[#e8ddcf]">
                  {t('player.currentDeck')}
                </span>
                <span className="text-[12px] text-[#8a7f72]">
                  {t('player.currentDeckCount', { count: deck.length, cap: deckCap })}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {PLAYER_CLASSES.map((classId) => {
                  const theme = classThemes[classId];
                  const count = deckByClass[classId];
                  const pct = deckCap > 0 ? Math.round((count / deckCap) * 100) : 0;
                  return (
                    <div key={classId} className="flex items-center gap-3">
                      <span
                        className="w-[70px] font-cinzel text-[12px]"
                        style={{ color: theme.accent }}
                      >
                        {getClassLabel(classId, t)}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-[2px] bg-[rgba(0,0,0,.4)]">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, background: theme.accent }}
                        />
                      </div>
                      <span className="w-11 text-right text-[12px] text-[#b7ab9c]">{count}</span>
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
          incomingName={cardById[swapIntent.cardId]?.name ?? swapIntent.cardId}
          deckCards={deck
            .map((id) => cardById[id])
            .filter((card): card is CardDefinition => Boolean(card))}
          onPick={confirmSwap}
          onCancel={() => setSwapIntent(null)}
        />
      )}

      {confirmCard && confirmClassId && (
        <UnlockCardModal
          name={confirmCard.name}
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
        <div className="w-[340px] shrink-0 overflow-hidden rounded-md border border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,#161110,#100c0b)]">
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
                    {quest.name}
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

        <div className="flex-1 rounded-md border border-[#8a744a] bg-[linear-gradient(165deg,#d8c9a0,#c3ac7d)] px-[34px] py-[30px] shadow-[inset_0_0_40px_-10px_rgba(60,45,20,.5)]">
          {selectedQuest ? (
            <>
              <div className="text-[10px] tracking-[.2em] text-[#6b5a38]">
                {questLocationLabel(selectedQuest, t)}
              </div>
              <div className="mt-1.5 font-cinzel text-[24px] text-[#2b2116]">
                {selectedQuest.name}
              </div>
              <div
                className="mt-2 font-cinzel text-[11px] tracking-[.12em]"
                style={{
                  color: selectedQuest.status === 'completed' ? '#3f6b4a' : '#8a5a1a',
                }}
              >
                {selectedQuest.status === 'completed' ? t('common.completed') : t('common.inProgress')}
              </div>
              <div className="my-4 h-px bg-[rgba(60,45,20,.25)]" />
              <p className="m-0 text-[14px] leading-relaxed text-[#3a2c1a]">
                {selectedQuest.description}
              </p>
              {steps && steps.length > 0 && (
                <div className="mt-5 flex flex-col gap-2.5">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <span
                        className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[3px] border text-[11px]"
                        style={{
                          borderColor: step.done ? '#3f6b4a' : '#8a744a',
                          background: step.done ? 'rgba(63,107,74,.15)' : 'transparent',
                          color: step.done ? '#3f6b4a' : '#8a744a',
                        }}
                      >
                        {step.done ? '✓' : ''}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{
                          color: step.done ? '#5a6b4a' : '#3a2c1a',
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
            <p className="m-0 text-[14px] text-[#3a2c1a]">{t('player.noQuestSelected')}</p>
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

        <div className="overflow-hidden rounded-md border border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,#161110,#100c0b)]">
          <div className="flex border-b border-[rgba(201,162,74,.28)] bg-[rgba(201,162,74,.06)] px-4 py-2.5">
            <span className="w-[46px]" />
            <span className="w-[180px] text-[10px] tracking-[.16em] text-[#8a7f72]">{t('common.name')}</span>
            <span className="flex-1 text-[10px] tracking-[.16em] text-[#8a7f72]">
              {t('common.description')}
            </span>
            <span className="w-[160px] text-right text-[10px] tracking-[.16em] text-[#8a7f72]">
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

      <div className="w-[440px] shrink-0 overflow-hidden rounded-md border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#1a1512,#110d0b)]">
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
          <div className="relative h-[340px] w-[180px] overflow-hidden rounded border border-[rgba(201,162,74,.2)] bg-[#0c0908]">
            <img
              src={portrait}
              alt=""
              className="h-full w-full object-cover object-top opacity-90"
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

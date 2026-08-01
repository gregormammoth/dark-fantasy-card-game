import { useMemo, useState } from 'react';
import type { CardClass, CardDefinition } from '@dark-fantasy/shared/types/card';
import type { PlayerProgression } from '@dark-fantasy/shared/types/progression';
import { PLAYER_PORTRAIT } from '@dark-fantasy/content/portraits';
import { getClassXp, getTotalXp } from '@dark-fantasy/game-engine';
import { Card } from '@/components/Card';
import { ClassProgressCard } from '@/components/player/ClassProgressCard';
import { DeckComposition } from '@/components/player/DeckComposition';
import { UnlockCardModal } from '@/components/player/UnlockCardModal';
import { classThemes } from '@/lib/cardTheme';
import {
  DECK_CAP,
  PLAYER_CLASSES,
  cardProgressMeta,
  getCardsForClass,
  getDefaultDeckIds,
  getPlayerCardDefinitions,
} from '@/data/playerProgress';

type CardStatus = 'unlocked' | 'available' | 'locked' | 'locked-xp';

interface PlayerScreenProps {
  progression: PlayerProgression;
  onBack: () => void;
  backLabel?: string;
}

function classLabel(classId: CardClass): string {
  return classThemes[classId].label[0] + classThemes[classId].label.slice(1).toLowerCase();
}

function cardStatus(
  cardId: string,
  classXp: number,
  unlockedOverride: Record<string, boolean>,
): CardStatus {
  const meta = cardProgressMeta[cardId];
  if (!meta) {
    return 'locked';
  }
  const unlocked = unlockedOverride[cardId] ?? meta.unlocked;
  if (unlocked) {
    return 'unlocked';
  }
  if (meta.requirement) {
    return 'locked';
  }
  if (meta.cost <= classXp) {
    return 'available';
  }
  return 'locked-xp';
}

export function PlayerScreen({
  progression,
  onBack,
  backLabel = '← World Map',
}: PlayerScreenProps) {
  const allCards = useMemo(() => getPlayerCardDefinitions(), []);
  const [selectedClassId, setSelectedClassId] = useState<CardClass>('fighter');
  const [unlockedOverride, setUnlockedOverride] = useState<Record<string, boolean>>({});
  const [deck, setDeck] = useState<string[]>(() => getDefaultDeckIds());
  const [confirmCardId, setConfirmCardId] = useState<string | null>(null);

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

  const cardNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const card of allCards) {
      map[card.id] = card.name;
    }
    return map;
  }, [allCards]);

  function spentXp(classId: CardClass): number {
    let spent = 0;
    for (const card of getCardsForClass(classId)) {
      const meta = cardProgressMeta[card.id];
      if (!meta) continue;
      if (unlockedOverride[card.id] && !meta.unlocked) {
        spent += meta.cost;
      }
    }
    return spent;
  }

  function currentXp(classId: CardClass): number {
    return Math.max(0, getClassXp(progression, classId) - spentXp(classId));
  }

  function buildClassSummary(classId: CardClass) {
    const xp = currentXp(classId);
    const earnedXp = getClassXp(progression, classId);
    const cards = getCardsForClass(classId);
    let unlockedCount = 0;
    let nextUnlock: string | null = null;

    for (const card of cards) {
      const status = cardStatus(card.id, xp, unlockedOverride);
      if (status === 'unlocked') {
        unlockedCount += 1;
      }
      const meta = cardProgressMeta[card.id];
      if (meta && !((unlockedOverride[card.id] ?? meta.unlocked)) && meta.requirement && !nextUnlock) {
        nextUnlock = `${meta.requirement} — ${card.name}`;
      }
    }

    return {
      id: classId,
      name: classLabel(classId),
      xp: earnedXp,
      xpPct: Math.min(100, earnedXp * 10),
      nextUnlock: nextUnlock ?? 'All current-tier cards unlocked',
      unlockedCount,
      selected: classId === selectedClassId,
    };
  }

  const classSummaries = PLAYER_CLASSES.map(buildClassSummary);
  const selectedSummary = buildClassSummary(selectedClassId);
  const selectedTheme = classThemes[selectedClassId];
  const selectedXp = currentXp(selectedClassId);
  const selectedCards = getCardsForClass(selectedClassId);

  let availableCount = 0;
  let lockedCount = 0;
  for (const card of selectedCards) {
    const status = cardStatus(card.id, selectedXp, unlockedOverride);
    if (status === 'available') availableCount += 1;
    if (status === 'locked' || status === 'locked-xp') lockedCount += 1;
  }

  const deckByClass = Object.fromEntries(PLAYER_CLASSES.map((id) => [id, 0])) as Record<
    CardClass,
    number
  >;
  for (const id of deck) {
    const classId = cardClassById[id];
    if (classId) deckByClass[classId] += 1;
  }

  const buildParts = PLAYER_CLASSES.filter((id) => deckByClass[id] > 0)
    .sort((a, b) => deckByClass[b] - deckByClass[a])
    .slice(0, 2)
    .map((id) => classLabel(id));
  const totalXp = getTotalXp(progression);

  const confirmCard = confirmCardId ? cardById[confirmCardId] : null;
  const confirmClassId = confirmCardId ? cardClassById[confirmCardId] : null;
  const confirmMeta = confirmCardId ? cardProgressMeta[confirmCardId] : null;

  function onCardClick(card: CardDefinition) {
    if (!card.class) return;
    const status = cardStatus(card.id, currentXp(card.class), unlockedOverride);
    if (status === 'unlocked') {
      setDeck((current) =>
        current.includes(card.id)
          ? current.filter((id) => id !== card.id)
          : current.length < DECK_CAP
            ? [...current, card.id]
            : current,
      );
      return;
    }
    if (status === 'available') {
      setConfirmCardId(card.id);
    }
  }

  function confirmUnlock() {
    if (!confirmCardId) return;
    setUnlockedOverride((current) => ({ ...current, [confirmCardId]: true }));
    setConfirmCardId(null);
  }

  return (
    <div className="flex min-h-[100dvh] justify-center px-6 py-8 text-[#e8ddcf] sm:px-10">
      <div className="flex w-full max-w-[1360px] flex-col gap-[26px]">
        <div className="flex items-center justify-between pr-12">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[#8a7f72] transition hover:text-[#e0b552]"
          >
            {backLabel}
          </button>
          <span className="font-cinzel text-[16px] tracking-[.3em] text-[#b8917f]">CHARACTER</span>
          <span className="text-[10px] tracking-[.18em] text-[#8a7f72]">DECK DEFINES CLASS</span>
        </div>

        <div className="flex gap-[26px] rounded-2xl border border-[rgba(201,162,74,.2)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-[30px] py-[26px] shadow-[0_30px_70px_-30px_#000]">
          <div className="relative shrink-0">
            <div className="h-[164px] w-[132px] overflow-hidden rounded-xl bg-[#0c0908]">
              <img src={PLAYER_PORTRAIT} alt="" className="h-full w-full object-cover object-top" />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-[rgba(201,162,74,.5)] shadow-[inset_0_0_24px_-6px_rgba(201,162,74,.5)]" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-3.5">
            <div>
              <div className="font-cinzel text-[26px] text-[#f0dfcb]">Unknown Prisoner</div>
              <div className="mt-1 text-[13px] italic text-[#8a7f72]">Escaped from Hollowfort</div>
            </div>
            <div className="flex flex-wrap gap-9">
              <div>
                <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">CURRENT BUILD</div>
                <div className="mt-1 font-cinzel text-[16px] text-[#e8ddcf]">
                  {buildParts.length ? buildParts.join(' / ') : 'Unaligned'}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">TOTAL XP</div>
                <div className="mt-1 font-cinzel text-[16px] text-[#e8ddcf]">
                  {totalXp.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">DECK</div>
                <div className="mt-1 font-cinzel text-[16px] text-[#e8ddcf]">
                  {deck.length} / {DECK_CAP}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-[10px] tracking-[.24em] text-[#8a7f72]">
            CLASS PROGRESSION · select a class to inspect
          </div>
          <div className="flex flex-col gap-[18px] lg:flex-row">
            {classSummaries.map((summary) => (
              <ClassProgressCard
                key={summary.id}
                summary={summary}
                onSelect={() => setSelectedClassId(summary.id)}
              />
            ))}
          </div>
        </div>

        <div
          className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#141110,#0f0c0b)]"
          style={{ border: `1px solid ${selectedTheme.accent}55` }}
        >
          <div
            className="flex flex-col gap-3 border-b border-[rgba(201,162,74,.14)] px-[26px] py-[18px] lg:flex-row lg:items-center lg:justify-between"
            style={{
              background: `linear-gradient(90deg, ${selectedTheme.accent}18, transparent)`,
            }}
          >
            <div className="flex items-baseline gap-3.5">
              <span
                className="font-cinzel text-[20px] tracking-[.08em]"
                style={{ color: selectedTheme.accent }}
              >
                {selectedSummary.name}
              </span>
              <span className="text-[11px] tracking-[.14em] text-[#8a7f72]">
                {selectedSummary.xp} XP
              </span>
            </div>
            <div className="flex flex-wrap gap-x-[22px] gap-y-1 text-[11px] text-[#b7ab9c]">
              <span>
                Available XP:{' '}
                <b className="font-cinzel font-medium text-[#e8ddcf]">{selectedXp}</b>
              </span>
              <span>
                Unlocked:{' '}
                <b className="font-cinzel font-medium text-[#e8ddcf]">
                  {selectedSummary.unlockedCount}
                </b>
              </span>
              <span>
                Available:{' '}
                <b className="font-cinzel font-medium text-[#e8ddcf]">{availableCount}</b>
              </span>
              <span>
                Locked: <b className="font-cinzel font-medium text-[#e8ddcf]">{lockedCount}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 px-[26px] py-[22px]">
            {selectedCards.map((definition) => {
              const status = cardStatus(definition.id, selectedXp, unlockedOverride);
              const locked = status === 'locked' || status === 'locked-xp';
              const inDeck = deck.includes(definition.id);
              const meta = cardProgressMeta[definition.id];
              const instance = { instanceId: definition.id, definition };
              let statusLabel = '';
              let statusColor = '#8a7f72';
              if (status === 'unlocked') {
                statusLabel = inDeck ? 'In deck — click to remove' : 'Unlocked — click to add';
                statusColor = '#7fb08a';
              } else if (status === 'available') {
                statusLabel = `Unlock — ${meta?.cost ?? 0} XP`;
                statusColor = selectedTheme.accent;
              } else if (status === 'locked-xp') {
                statusLabel = `Needs ${meta?.cost ?? 0} XP (have ${selectedXp})`;
              } else {
                statusLabel = meta?.requirement
                  ? `Requires ${meta.requirement}`
                  : 'Locked';
              }

              return (
                <Card
                  key={definition.id}
                  card={instance}
                  variant="collection"
                  locked={locked}
                  inDeck={inDeck}
                  statusLabel={statusLabel}
                  statusColor={statusColor}
                  onClick={() => onCardClick(definition)}
                  disabled={locked}
                />
              );
            })}
          </div>
        </div>

        <DeckComposition
          deckIds={deck}
          cardClassById={cardClassById}
          cardNameById={cardNameById}
          deckCap={DECK_CAP}
        />
      </div>

      {confirmCard && confirmClassId && confirmMeta && (
        <UnlockCardModal
          name={confirmCard.name}
          className={classLabel(confirmClassId)}
          color={classThemes[confirmClassId].accent}
          borderColor={`${classThemes[confirmClassId].accent}66`}
          cost={confirmMeta.cost}
          currentXp={currentXp(confirmClassId)}
          afterXp={currentXp(confirmClassId) - confirmMeta.cost}
          onConfirm={confirmUnlock}
          onCancel={() => setConfirmCardId(null)}
        />
      )}
    </div>
  );
}

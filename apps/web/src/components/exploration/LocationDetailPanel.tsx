'use client';

import type {
  ExplorationContext,
  LocationDefinition,
} from '@dark-fantasy/shared/types/exploration';
import { canMoveTo, getLocationStatus, isLocationLocked, isExitBlocked, isCorridorBlocked, isDiningHallPathBlocked } from '@dark-fantasy/game-engine/engine/exploration/map';
import { isNpcAvailable, listQuestMarksForLocation } from '@dark-fantasy/game-engine/engine/exploration/quests';
import { isEnemyAvailable } from '@dark-fantasy/game-engine/engine/exploration/locationEncounters';
import { activityColors } from '@/lib/explorationTheme';
import {
  getEnemyName,
  getEnemyTier,
  getLocationDescription,
  getLocationName,
  getLocationSubtitle,
  getLootDescription,
  getLootName,
  getNpcName,
  getNpcTag,
  getQuestName,
} from '@/lib/contentLabels';
import { translateQuestMarkHint } from '@/lib/explorationText';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { useTranslation } from '@/i18n/useTranslation';

const LOOT_IMAGES: Record<string, string> = {
  dining_keyring: '/items/dining_keyring.png',
  dried_lavender: '/items/dried_lavender.png',
  lowcap_mushroom: '/items/lowcap_mushroom.png',
};

interface LocationDetailPanelProps {
  context: ExplorationContext;
  location: LocationDefinition | null;
  onClose: () => void;
  onTravel: (locationId: string) => void;
  onTalk?: (locationId: string, npcId: string) => void;
  onFight?: (locationId: string, enemyId: string) => void;
  onEscape?: () => void;
}

export function LocationDetailPanel({
  context,
  location,
  onClose,
  onTravel,
  onTalk,
  onFight,
  onEscape,
}: LocationDetailPanelProps) {
  const { t } = useTranslation();
  if (!location) {
    return null;
  }

  const status = getLocationStatus(context, location.id);
  const locked = isLocationLocked(context, location.id);
  const exitBlocked = isExitBlocked(context, location.id);
  const corridorBlocked = isCorridorBlocked(context, location.id);
  const diningPathBlocked = isDiningHallPathBlocked(
    context,
    context.currentLocationId,
    location.id,
  );
  const showInfo = status !== 'distant' && !locked;
  const isHere = location.id === context.currentLocationId;
  const canTravel = canMoveTo(context, location.id) && !isHere;
  const availableEnemies = location.enemies.filter((enemy) => isEnemyAvailable(context, enemy));
  const activeEnemy = availableEnemies[0];
  const availableNpcs = location.npcs.filter((npc) => isNpcAvailable(context, npc));
  const unclaimedLoot =
    availableEnemies.length > 0 ? [] : location.loot.filter((item) => !item.claimed);
  const questMarks = listQuestMarksForLocation(context, location.id);
  const questCards = [
    ...(location.quest
      ? [
          {
            key: 'location-quest',
            name: location.quest.name,
            description: location.quest.description,
          },
        ]
      : []),
    ...questMarks.map((mark) => ({
      key: mark.questId,
      name: getQuestName(mark.questId, t, mark.questName),
      description: translateQuestMarkHint(mark.hintKey, mark.questId, t, mark.hint),
    })),
  ];

  const chips = locked
    ? []
    : [
        ...availableEnemies.map(() => ({ label: t('location.chipCombat'), color: activityColors.combat })),
        ...unclaimedLoot.map(() => ({ label: t('location.chipLoot'), color: activityColors.loot })),
        ...availableNpcs.map(() => ({ label: t('location.chipNpc'), color: activityColors.npc })),
        ...(questCards.length > 0
          ? [{ label: t('location.chipQuest'), color: activityColors.quest }]
          : []),
      ];

  return (
    <div
      className="absolute bottom-0 right-0 top-0 z-[15] flex w-[370px] animate-[slidein_.2s_ease-out] flex-col border-l border-[rgba(232,200,116,.3)]"
      style={{ background: 'linear-gradient(180deg,rgba(20,34,56,.97),rgba(10,16,26,.99))', boxShadow: '-30px 0 60px -20px rgba(0,0,0,.8),0 0 40px -18px rgba(74,192,255,.35)' }}
    >
      <div className="relative h-[190px] shrink-0 overflow-hidden">
        {showInfo && location.image && (
          <img
            src={location.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,26,.15),rgba(9,7,6,.96))]" />
        <div className="absolute bottom-3.5 left-[22px]">
          <span
            className="text-[10px] tracking-[.24em] text-[#e8c874] [text-shadow:0_1px_4px_#000]"
            style={{ color: locked ? '#5c7086' : undefined }}
          >
            {locked
              ? t('location.branchSealed')
              : showInfo
                ? getLocationSubtitle(location.id, t, location.subtitle).toUpperCase()
                : t('location.unknownChamber')}
          </span>
          <div className="mt-1 font-cinzel text-[22px] leading-tight text-[#fff6e0] [text-shadow:0_2px_8px_#000]">
            {locked
              ? t('location.sealed')
              : showInfo
                ? getLocationName(location.id, t, location.name)
                : t('location.unknown')}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[18px]">
        <p className="m-0 text-[13px] italic leading-relaxed text-[#c2d0e0]">
          {locked
            ? t('location.branchLockedDesc')
            : showInfo
              ? getLocationDescription(location.id, t, location.description)
              : t('location.unexploredDesc')}
        </p>

        {exitBlocked && showInfo && (
          <p className="m-0 text-[12px] leading-relaxed text-[#ff8f85]">{t('location.exitBlocked')}</p>
        )}

        {corridorBlocked && showInfo && (
          <p className="m-0 text-[12px] leading-relaxed text-[#ff8f85]">{t('location.corridorBlocked')}</p>
        )}

        {diningPathBlocked && showInfo && (
          <p className="m-0 text-[12px] leading-relaxed text-[#ff8f85]">{t('location.diningBlocked')}</p>
        )}

        {showInfo && chips.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[.22em] text-[#7d93ad]">{t('location.availableHere')}</span>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <span
                  key={`${chip.label}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] text-[#e8ddcf]"
                  style={{
                    background: 'rgba(255,255,255,.04)',
                    borderColor: `${chip.color}55`,
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: chip.color }}
                  />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {showInfo && availableNpcs.map((npc) => (
          <div
            key={npc.id}
            className="flex items-center gap-3 rounded-[5px] border-l-[3px] border-[#5b86c4] bg-[rgba(91,134,196,.1)] px-3 py-2.5"
          >
            {npc.image ? (
              <CharacterPortrait
                src={npc.image}
                className="h-[52px] w-[52px] shrink-0 rounded-full border border-[rgba(91,134,196,.4)]"
                expandable={false}
                media="still"
              />
            ) : null}
            <div className="flex-1">
              <div className="text-[13px] text-[#d7e2f2]">
                {getNpcName(npc.id, t, npc.name)}
              </div>
              <div className="mt-0.5 text-[10px] tracking-wider text-[#9fb3d6]">
                {getNpcTag(npc.id, t, npc.tag ?? t('common.npc')).toUpperCase()}
              </div>
            </div>
            {isHere && onTalk && (
              <button
                type="button"
                onClick={() => onTalk(location.id, npc.id)}
                className="shrink-0 rounded-[5px] border border-[rgba(91,134,196,.5)] bg-[rgba(91,134,196,.15)] px-2.5 py-2 font-cinzel text-[10px] tracking-wider text-[#cfe0fa] transition hover:brightness-110"
              >
                {t('location.talk')}
              </button>
            )}
          </div>
        ))}

        {activeEnemy && showInfo && (
          <div className="flex items-center gap-3 rounded-[5px] border-l-[3px] border-[#d6443a] bg-[rgba(214,68,58,.1)] px-3 py-2.5">
            {activeEnemy.image ? (
              <CharacterPortrait
                src={activeEnemy.image}
                className="h-[52px] w-[52px] shrink-0 rounded-[5px] border border-[rgba(224,82,74,.4)]"
                expandable={false}
                media="still"
              />
            ) : (
              <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] border border-[#ff6a5c] bg-[rgba(120,16,14,.9)]">
                <span className="absolute h-0.5 w-[11px] rotate-45 bg-[#ffd9d2]" />
                <span className="absolute h-0.5 w-[11px] -rotate-45 bg-[#ffd9d2]" />
              </span>
            )}
            <div className="flex-1">
              <div className="text-[13px] text-[#ffd9d2]">
                {getEnemyName(activeEnemy.id, t, activeEnemy.name)}
              </div>
              <div className="mt-0.5 text-[10px] tracking-wider text-[#c99]">
                {getEnemyTier(activeEnemy.id, t, activeEnemy.tier)}
              </div>
            </div>
            {isHere && onFight && (
              <button
                type="button"
                onClick={() => onFight(location.id, activeEnemy.id)}
                className="shrink-0 rounded-[5px] border border-[rgba(224,82,74,.5)] bg-[rgba(224,82,74,.15)] px-2.5 py-2 font-cinzel text-[10px] tracking-wider text-[#ffd9d2] transition hover:brightness-110"
              >
                {t('location.fight')}
              </button>
            )}
          </div>
        )}

        {showInfo && questCards.map((quest) => (
          <div
            key={quest.key}
            className="flex flex-col gap-1.5 rounded-[5px] px-4 py-3.5"
            style={{ background: 'linear-gradient(160deg,rgba(20,34,56,.9),rgba(10,16,26,.95))', border: '1px solid rgba(232,200,116,.28)' }}
          >
            <span className="font-cinzel text-[9px] tracking-[.2em] text-[#7d93ad]">{t('common.quest')}</span>
            <div className="font-cinzel text-[14px] text-[#eef3f8]">{quest.name}</div>
            <div className="text-[12px] leading-relaxed text-[#9db4cc]">
              {quest.description}
            </div>
          </div>
        ))}

        {showInfo && unclaimedLoot.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[.22em] text-[#7d93ad]">{t('location.loot')}</span>
            <div className="flex flex-wrap gap-2">
              {unclaimedLoot.map((loot) => {
                const image = LOOT_IMAGES[loot.id];
                return (
                  <div
                    key={loot.id}
                    className="w-[140px] overflow-hidden rounded-[5px] border border-[rgba(201,162,74,.35)] bg-[#12100f]"
                  >
                    <div className="relative h-[88px] bg-[#1a1512]">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      ) : null}
                      <span className="absolute left-1.5 top-1.5 rounded-[3px] bg-[rgba(201,162,74,.9)] px-1.5 py-0.5 text-[7px] tracking-wider text-[#1a1208]">
                        {t('common.item')}
                      </span>
                    </div>
                    <div className="border-t-2 border-[#c9a24a] px-2.5 py-2">
                      <div className="font-cinzel text-[12px] text-[#e8ddcf]">
                        {getLootName(loot.id, t, loot.name)}
                      </div>
                      <div className="mt-1 text-[10px] text-[#a99]">
                        {getLootDescription(loot.id, t, loot.description)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-[rgba(232,200,116,.14)] px-[22px] py-4">
        {canTravel && (
          <button
            type="button"
            disabled={context.hand.length <= 0}
            onClick={() => onTravel(location.id)}
            className="flex-1 rounded-[8px] border border-[rgba(224,82,74,.6)] px-3 py-[13px] font-cinzel text-[13px] tracking-[.1em] text-[#fff2ee] transition hover:brightness-110 hover:-translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'linear-gradient(180deg,rgba(224,82,74,.28),rgba(90,23,19,.35))', boxShadow: '0 1px 0 rgba(255,255,255,.1) inset,0 14px 26px -12px rgba(0,0,0,.8)' }}
          >
            {t('location.travelHere')}
          </button>
        )}
        {isHere && (
          <span className="flex-1 rounded-[8px] border border-[rgba(232,200,116,.15)] px-3 py-[13px] text-center font-cinzel text-[12px] tracking-[.1em] text-[#5c6a7a]">
            ◆ {t('location.youAreHere')}
          </span>
        )}
        {!isHere && status === 'visited' && !canTravel && (
          <button
            type="button"
            disabled={context.hand.length <= 0 || !canMoveTo(context, location.id)}
            onClick={() => onTravel(location.id)}
            className="flex-1 rounded-[8px] border border-[rgba(232,200,116,.35)] px-3 py-[13px] font-cinzel text-[12px] tracking-[.1em] text-[#e8c874] transition hover:border-[rgba(232,200,116,.8)] hover:-translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'linear-gradient(180deg,rgba(232,200,116,.12),rgba(0,0,0,.2))', boxShadow: '0 1px 0 rgba(255,255,255,.06) inset' }}
          >
            {t('location.returnHere')}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-[46px] rounded-[8px] border border-[rgba(232,200,116,.24)] text-[#7d93ad] transition hover:border-[rgba(232,200,116,.5)] hover:text-[#eef3f8]"
          style={{ background: 'linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.2))', boxShadow: '0 1px 0 rgba(255,255,255,.04) inset' }}
        >
          ✕
        </button>
      </div>
      {location.id === 'exit_gate' && status === 'visited' && isHere && !exitBlocked && onEscape && (
        <button
          type="button"
          onClick={onEscape}
          className="mx-[22px] mb-5 block w-[calc(100%-44px)] rounded-[5px] border border-[rgba(232,200,116,.5)] px-3 py-3 text-center font-cinzel text-[12px] tracking-[.1em] text-[#f3e2d6] transition hover:brightness-110"
          style={{ background: 'linear-gradient(180deg,rgba(232,200,116,.2),rgba(90,68,19,.3))' }}
        >
          {t('location.escape')} →
        </button>
      )}
    </div>
  );
}

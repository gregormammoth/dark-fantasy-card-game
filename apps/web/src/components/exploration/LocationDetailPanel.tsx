import type {
  ExplorationActionType,
  ExplorationContext,
  LocationDefinition,
} from '@dark-fantasy/shared/types/exploration';
import { canMoveTo, getLocationStatus, isInteractionAvailable, isLocationLocked, isExitBlocked, isCorridorBlocked } from '@dark-fantasy/game-engine/engine/exploration/map';
import { canPlayAction } from '@dark-fantasy/game-engine/engine/exploration/actions';
import { isNpcAvailable } from '@dark-fantasy/game-engine/engine/exploration/quests';
import { isEnemyAvailable } from '@dark-fantasy/game-engine/engine/exploration/locationEncounters';
import { activityColors, locationTypeColors } from '@/lib/explorationTheme';

interface LocationDetailPanelProps {
  context: ExplorationContext;
  location: LocationDefinition | null;
  onClose: () => void;
  onTravel: (locationId: string) => void;
  onAction: (action: ExplorationActionType, options?: { interactionId?: string; targetId?: string }) => void;
  onTalk?: (locationId: string, npcId: string) => void;
  onFight?: (locationId: string, enemyId: string) => void;
  onEscape?: () => void;
}

export function LocationDetailPanel({
  context,
  location,
  onClose,
  onTravel,
  onAction,
  onTalk,
  onFight,
  onEscape,
}: LocationDetailPanelProps) {
  if (!location) {
    return null;
  }

  const status = getLocationStatus(context, location.id);
  const locked = isLocationLocked(context, location.id);
  const exitBlocked = isExitBlocked(context, location.id);
  const corridorBlocked = isCorridorBlocked(context, location.id);
  const showInfo = status !== 'distant' && !locked;
  const isHere = location.id === context.currentLocationId;
  const canTravel = canMoveTo(context, location.id) && !isHere;
  const hasCard = !!context.selectedCardInstanceId;
  const availableEnemies = location.enemies.filter((enemy) => isEnemyAvailable(context, enemy));
  const activeEnemy = availableEnemies[0];
  const availableNpcs = location.npcs.filter((npc) => isNpcAvailable(context, npc));
  const unclaimedLoot = location.loot.filter((item) => !item.claimed);
  const availableInteractions = location.interactions.filter((item) =>
    isInteractionAvailable(context, item.id),
  );

  const chips = locked
    ? []
    : [
        ...availableEnemies.map(() => ({ label: 'Combat', color: activityColors.combat })),
        ...unclaimedLoot.map(() => ({ label: 'Loot', color: activityColors.loot })),
        ...availableNpcs.map(() => ({ label: 'NPC', color: activityColors.npc })),
        ...(location.quest ? [{ label: 'Quest', color: activityColors.quest }] : []),
        ...location.interactions
          .filter((item) => item.action === 'REST' && !item.completed)
          .map(() => ({ label: 'Rest', color: activityColors.rest })),
      ];

  return (
    <div className="absolute bottom-0 right-0 top-0 z-[15] flex w-[370px] animate-[slidein_.2s_ease-out] flex-col border-l border-[rgba(201,162,74,.24)] bg-[linear-gradient(180deg,rgba(15,11,10,.97),rgba(9,7,6,.99))] shadow-[-30px_0_60px_-20px_rgba(0,0,0,.7)]">
      <div className="relative h-[160px] shrink-0 overflow-hidden">
        {showInfo && location.image && (
          <img
            src={location.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,.2),rgba(9,7,6,.96))]" />
        <div className="absolute bottom-3.5 left-[22px]">
          <span
            className="text-[10px] tracking-[.24em] [text-shadow:0_1px_4px_#000]"
            style={{ color: locked ? '#5a534a' : locationTypeColors[location.type] }}
          >
            {locked
              ? 'BRANCH SEALED'
              : showInfo
                ? location.subtitle.toUpperCase()
                : 'UNKNOWN CHAMBER'}
          </span>
          <div className="mt-1 font-cinzel text-[22px] leading-tight text-[#f3ead8] [text-shadow:0_2px_8px_#000]">
            {locked ? 'SEALED' : showInfo ? location.name : '???'}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[22px] py-[18px]">
        <p className="m-0 text-[13px] italic leading-relaxed text-[#c7bba9]">
          {locked
            ? 'You committed to another path out of Hollowfort. This door will not open again.'
            : showInfo
              ? location.description
              : 'This part of the prison is still unexplored. Find a path through a nearby room first.'}
        </p>

        {exitBlocked && showInfo && (
          <p className="m-0 text-[12px] leading-relaxed text-[#ff8f85]">
            Defeat the boss on your chosen path before the Exit Gate will open.
          </p>
        )}

        {corridorBlocked && showInfo && (
          <p className="m-0 text-[12px] leading-relaxed text-[#ff8f85]">
            The Sorcerer bars the Central Corridor until his ingredients are delivered — or until he falls.
          </p>
        )}

        {showInfo && chips.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">AVAILABLE HERE</span>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <span
                  key={`${chip.label}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-[#e8ddcf]"
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
            className="flex items-center gap-3 rounded-[10px] border-l-[3px] border-[#5b86c4] bg-[rgba(91,134,196,.1)] px-3 py-2.5"
          >
            {npc.image ? (
              <img
                src={npc.image}
                alt=""
                className="h-[38px] w-[38px] shrink-0 rounded-full border border-[rgba(91,134,196,.35)] object-cover object-top"
                draggable={false}
              />
            ) : null}
            <div className="flex-1">
              <div className="text-[13px] text-[#d7e2f2]">{npc.name}</div>
              <div className="mt-0.5 text-[10px] tracking-wider text-[#9fb3d6]">
                {(npc.tag ?? 'NPC').toUpperCase()}
              </div>
            </div>
            {isHere && onTalk && (
              <button
                type="button"
                onClick={() => onTalk(location.id, npc.id)}
                className="shrink-0 rounded-lg border border-[rgba(91,134,196,.5)] bg-[rgba(91,134,196,.15)] px-2.5 py-2 font-cinzel text-[10px] tracking-wider text-[#cfe0fa] transition hover:brightness-110"
              >
                TALK
              </button>
            )}
          </div>
        ))}

        {activeEnemy && showInfo && (
          <div className="flex items-center gap-3 rounded-[10px] border-l-[3px] border-[#d6443a] bg-[rgba(214,68,58,.1)] px-3 py-2.5">
            {activeEnemy.image ? (
              <img
                src={activeEnemy.image}
                alt=""
                className="h-[38px] w-[38px] shrink-0 rounded-[6px] border border-[rgba(224,82,74,.4)] object-cover object-top"
                draggable={false}
              />
            ) : null}
            <div className="flex-1">
              <div className="text-[13px] text-[#ffd9d2]">{activeEnemy.name}</div>
              <div className="mt-0.5 text-[10px] tracking-wider text-[#c99]">{activeEnemy.tier}</div>
            </div>
            {isHere && onFight && (
              <button
                type="button"
                onClick={() => onFight(location.id, activeEnemy.id)}
                className="shrink-0 rounded-lg border border-[rgba(224,82,74,.5)] bg-[rgba(224,82,74,.15)] px-2.5 py-2 font-cinzel text-[10px] tracking-wider text-[#ffd9d2] transition hover:brightness-110"
              >
                FIGHT
              </button>
            )}
          </div>
        )}

        {showInfo && location.quest && (
          <div className="flex items-start gap-3 rounded-[10px] border-l-[3px] border-[#e0b552] bg-[rgba(224,181,82,.08)] px-3 py-2.5">
            <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rotate-45 border-2 border-[#e0b552]" />
            <div>
              <div className="text-[13px] text-[#f0e2c0]">{location.quest.name}</div>
              <div className="mt-1 text-[11px] leading-snug text-[#b7ab9c]">
                {location.quest.description}
              </div>
            </div>
          </div>
        )}

        {showInfo && unclaimedLoot.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">LOOT</span>
            {unclaimedLoot.map((loot) => (
              <div
                key={loot.id}
                className="rounded-[10px] border border-[rgba(201,162,74,.28)] bg-[#12100f] px-3 py-2"
              >
                <div className="font-cinzel text-[12px] text-[#e8ddcf]">{loot.name}</div>
                <div className="mt-1 text-[10px] text-[#a99]">{loot.description}</div>
              </div>
            ))}
          </div>
        )}

        {isHere && showInfo && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-[.22em] text-[#8a7f72]">
              {hasCard ? 'PLAY A CARD TO ACT' : 'SELECT A CARD FIRST'}
            </span>
            {availableInteractions.map((interaction) => {
              const enabled =
                hasCard &&
                canPlayAction(context, interaction.action, {
                  interactionId: interaction.id,
                  targetId: interaction.targetId,
                  cardInstanceId: context.selectedCardInstanceId ?? undefined,
                });
              return (
                <button
                  key={interaction.id}
                  type="button"
                  disabled={!enabled}
                  onClick={() =>
                    onAction(interaction.action, {
                      interactionId: interaction.id,
                      targetId: interaction.targetId,
                    })
                  }
                  className="rounded-[10px] border border-[rgba(201,162,74,.3)] px-3 py-2.5 text-left font-cinzel text-[12px] tracking-wide text-[#e8ddcf] transition enabled:hover:border-[rgba(201,162,74,.7)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {interaction.label}
                  <span className="mt-1 block text-[10px] tracking-[.14em] text-[#8a7f72]">
                    {interaction.action}
                    {interaction.locked ? ' · LOCKED' : ''}
                  </span>
                </button>
              );
            })}
            {availableInteractions.length === 0 && (
              <span className="text-[12px] text-[#8a7f72]">No interactions left here.</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2.5 border-t border-[rgba(201,162,74,.14)] px-[22px] py-4">
        {canTravel && (
          <button
            type="button"
            disabled={!hasCard || context.actionsRemaining <= 0}
            onClick={() => onTravel(location.id)}
            className="flex-1 rounded-[10px] border border-[rgba(224,82,74,.6)] bg-[linear-gradient(180deg,rgba(224,82,74,.22),rgba(90,23,19,.3))] px-3 py-3 font-cinzel text-[13px] tracking-wider text-[#f3e2d6] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            TRAVEL HERE
          </button>
        )}
        {isHere && (
          <span className="flex-1 rounded-[10px] border border-[rgba(224,181,82,.4)] px-3 py-3 text-center text-[11px] tracking-wider text-[#e0b552]">
            ◆ YOU ARE HERE
          </span>
        )}
        {!isHere && status === 'visited' && !canTravel && (
          <button
            type="button"
            disabled={!hasCard || context.actionsRemaining <= 0 || !canMoveTo(context, location.id)}
            onClick={() => onTravel(location.id)}
            className="flex-1 rounded-[10px] border border-[rgba(201,162,74,.3)] bg-transparent px-3 py-3 font-cinzel text-[12px] tracking-wider text-[#c9a24a] transition hover:border-[rgba(201,162,74,.7)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            RETURN HERE
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-[46px] rounded-[10px] border border-[rgba(201,162,74,.24)] text-[#8a7f72] transition hover:text-[#e8ddcf]"
        >
          ✕
        </button>
      </div>
      {location.id === 'exit_gate' && status === 'visited' && isHere && !exitBlocked && onEscape && (
        <button
          type="button"
          onClick={onEscape}
          className="mx-[22px] mb-5 w-[calc(100%-44px)] rounded-[10px] border border-[rgba(224,181,82,.5)] bg-[linear-gradient(180deg,rgba(224,181,82,.2),rgba(90,68,19,.3))] px-3 py-3 text-center font-cinzel text-[12px] tracking-[.1em] text-[#f3e2d6] transition hover:brightness-110"
        >
          ESCAPE HOLLOWFORT →
        </button>
      )}
    </div>
  );
}

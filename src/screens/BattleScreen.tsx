import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { battleMachine } from '@/machine/battleMachine';
import { getPlayerHealth, getEnemyHealth } from '@/engine/health';
import { CombatantPanel } from '@/components/CombatantPanel';
import { Hand } from '@/components/Hand';
import { Combo } from '@/components/Combo';
import { PileInfo } from '@/components/PileInfo';
import { ActionButton } from '@/components/ActionButton';
import { BattleLog } from '@/components/BattleLog';

type BattleActor = ActorRefFrom<typeof battleMachine>;

interface BattleScreenProps {
  actor: BattleActor;
}

export function BattleScreen({ actor }: BattleScreenProps) {
  const snapshot = useSelector(actor, (s) => s);
  const { context: battle, value } = snapshot;

  const state = typeof value === 'string' ? value : Object.keys(value)[0];
  const isPlayerTurn = state === 'playerTurn';
  const isIdle = state === 'idle';
  const isVictory = state === 'victory';
  const isDefeat = state === 'defeat';
  const isResolving =
    state === 'resolvingPlayerCombo' || state === 'resolvingEnemyCard';

  const playerHealth = getPlayerHealth(battle);
  const enemyHealth = getEnemyHealth(battle);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 p-6">
      <div className="flex flex-1 flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-red-300/90 uppercase">
            Dark Fantasy Duel
          </h1>
          <p className="mt-1 text-xs tracking-widest text-stone-500 uppercase">
            {state.replace(/([A-Z])/g, ' $1').trim()}
          </p>
        </header>

        <section className="flex items-start justify-between gap-8">
          <CombatantPanel
            name="Player"
            health={playerHealth}
            maxHealth={battle.playerMaxHealth}
            shield={battle.player.shield}
            maxShield={battle.player.maxShield}
            barrier={battle.player.barrier}
            deckCount={battle.player.deck.length}
            handCount={battle.player.hand.length + battle.combo.length}
            poison={battle.playerPoison}
          />
          <CombatantPanel
            name={battle.enemy.name}
            health={enemyHealth}
            maxHealth={battle.enemyMaxHealth}
            shield={battle.enemy.shield}
            maxShield={battle.enemy.maxShield}
            deckCount={battle.enemy.deck.length}
            poison={battle.enemyPoison}
            align="right"
          />
        </section>

        <section className="flex flex-col items-center gap-6">
          <PileInfo
            deckSize={battle.player.deck.length}
            discardSize={battle.player.discard.length}
          />
          <Combo
            cards={battle.combo}
            disabled={!isPlayerTurn || isResolving}
            onRemoveCard={(id) => actor.send({ type: 'REMOVE_FROM_COMBO', cardInstanceId: id })}
          />
          <Hand
            cards={battle.player.hand}
            disabled={!isPlayerTurn || isResolving}
            onAddToCombo={(id) => actor.send({ type: 'ADD_TO_COMBO', cardInstanceId: id })}
          />
        </section>

        <footer className="flex justify-center gap-4">
          {isIdle && (
            <ActionButton label="Start Battle" onClick={() => actor.send({ type: 'START_BATTLE' })} />
          )}
          {isPlayerTurn && (
            <ActionButton
              label="End Turn"
              onClick={() => actor.send({ type: 'END_TURN' })}
              disabled={isResolving}
            />
          )}
          {(isVictory || isDefeat) && (
            <>
              <p className="self-center text-lg font-semibold text-stone-300">
                {isVictory ? 'Victory!' : 'Defeat...'}
              </p>
              <ActionButton
                label="Restart Battle"
                variant="secondary"
                onClick={() => actor.send({ type: 'RESTART' })}
              />
            </>
          )}
        </footer>
      </div>

      {!isIdle && <BattleLog entries={battle.log} />}
    </div>
  );
}

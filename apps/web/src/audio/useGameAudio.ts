import { useEffect, useRef } from 'react';
import { getAudioManager } from './AudioManager';
import { computeAtmosphereFromBattle, type GameAudioPhase } from './types';
import { useAudio } from './useAudio';

export function useGameAudio(input: {
  phase: GameAudioPhase;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerPoison?: number;
  lastPlayerDrawCount?: number;
  turnCount?: number;
} | null): void {
  const { play, unlocked } = useAudio();
  const prevDrawToken = useRef('');

  useEffect(() => {
    if (!unlocked) return;
    void getAudioManager().startGameplayBed();
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked || !input) return;
    if (input.phase === 'victory' || input.phase === 'defeat') return;

    getAudioManager().updateAtmosphere(
      computeAtmosphereFromBattle({
        playerHp: input.playerHp,
        playerMaxHp: input.playerMaxHp,
        enemyHp: input.enemyHp,
        enemyMaxHp: input.enemyMaxHp,
        playerPoison: input.playerPoison,
        phase: input.phase,
      }),
    );
  }, [
    unlocked,
    input?.phase,
    input?.playerHp,
    input?.playerMaxHp,
    input?.enemyHp,
    input?.enemyMaxHp,
    input?.playerPoison,
  ]);

  useEffect(() => {
    if (!unlocked || !input || input.phase !== 'battle') return;
    const drawCount = input.lastPlayerDrawCount ?? 0;
    if (drawCount <= 0) return;
    const token = `${input.turnCount ?? 0}:${drawCount}`;
    if (prevDrawToken.current === token) return;
    prevDrawToken.current = token;
    play('draw_card');
  }, [
    unlocked,
    play,
    input?.phase,
    input?.lastPlayerDrawCount,
    input?.turnCount,
  ]);
}

# Audio system

Frontend-only audio for **Dark Fantasy Card Game**. Howler + procedural fallbacks. Reacts to UI and screen/battle snapshots — not coupled to engine rules.

## Layout

```
src/audio/
  types.ts           — SoundId, settings, atmosphere, MusicScreen
  soundManifest.ts   — ids → public/audio paths
  proceduralSfx.ts   — Web Audio fallbacks
  atmosphere.ts      — battle overlays + ambience targets
  AudioManager.ts    — Howler, screen beds, crossfade
  audioStore.ts      — settings persistence
  useAudio.ts / useHoverSound.ts / useGameAudio.ts / useGameOverAudio.ts
  useScreenMusic.ts  — world | exploration | battle theme switch

src/components/
  AudioProvider.tsx
  AudioSettings.tsx

public/audio/
  ui/          — SFX (ogg/wav)
  music/       — world.ogg, exploration.ogg, battle.ogg (+ overlays/stings)
  events/      — encounter-sting
  combat/      — combat-hit
  ambience/    — loops + distant-howl
```

## Unlock

No banner. First gesture unlocks; Start/Enter also call `unlock()`. Preloads UI SFX, starts the active screen theme (`world` by default).

## Screen music

| Screen | File | Id |
|--------|------|----|
| World map | `music/world.ogg` | `world_theme` |
| Exploration | `music/exploration.ogg` | `exploration_theme` |
| Battle | `music/battle.ogg` | `battle_theme` |

`useScreenMusic(screen)` in `main.tsx` crossfades between beds. Empty placeholder files fall back to procedural until real tracks are dropped in.

Battle overlays (from HP tension): `battle_danger`, `defeat_drone`.

## SFX ids

| Id | File | When |
|----|------|------|
| `card_hover` | `ui/card-hover` | Card hover |
| `card_play` | `ui/card-play` | Card click |
| `draw_card` | `ui/draw-card` | Turn draw |
| `shield_gain` | `ui/shield-gain` | Shield / barrier gain |
| `block_reveal` | `ui/block-reveal` | Shield/barrier block |
| `end_turn` | `ui/end-turn` | End turn |
| `modal_open` | `ui/modal-open` | Modal open |
| `fate_roll` | `ui/fate-roll` | Encounter fate beat |
| `victory_reveal` / `defeat_reveal` | `ui/victory-reveal` / `defeat-reveal` | Battle result |
| `encounter_sting` | `events/encounter-sting` | Exploration encounter |
| `combat_hit` | `combat/combat-hit` | Reserved combat hit |
| `button_hover` | `ui/button-hover` | Generic UI hover |
| `danger_warning` | `ui/danger-warning` | Reserved warning |
| `victory_sting` / `defeat_sting` | `music/*-sting` | Game-over suite |
| `distant_howl` | `ambience/distant-howl` | Sparse ambience one-shot |

## Settings

`localStorage` key: `dfcg-audio-settings-v1` — master / music / SFX / mute.

## Usage

```tsx
useScreenMusic(screen);
useGameAudio({ phase: 'battle', playerHp, playerMaxHp, enemyHp, enemyMaxHp, ... });
useGameOverAudio(isVictory ? 'victory' : isDefeat ? 'defeat' : null);
play('card_play');
```

Replace empty files under `public/audio/` with real OGG/MP3/WAV; keep the same filenames.

# Audio system

Frontend-only audio for **Dark Fantasy Card Game**. Howler + procedural fallbacks. Reacts to UI and battle snapshots — not coupled to engine rules.

## Layout

```
src/audio/
  types.ts           — SoundId, settings, atmosphere profile
  soundManifest.ts   — ids, public/audio paths, volumes
  proceduralSfx.ts   — Web Audio fallbacks
  atmosphere.ts      — layer targets from battle tension
  AudioManager.ts    — Howler + crossfade + beds
  audioStore.ts      — settings persistence (module store + useSyncExternalStore)
  useAudio.ts        — play / volume / unlock
  useGameAudio.ts    — battle atmosphere + draw SFX
  useGameOverAudio.ts
  useHoverSound.ts
  index.ts

src/components/
  AudioProvider.tsx  — hydrate + unlock on first gesture
  AudioSettings.tsx  — mute + volume sliders
```

## Unlock

No banner. `AudioProvider` unlocks on the first `pointerdown` / `keydown`. Meaningful Start/Enter buttons also call `unlock()` explicitly. After unlock: preload UI SFX, start procedural `base_ambient` bed.

## Sound ids (UI)

| Id | When |
|----|------|
| `card_hover` | Card pointer enter |
| `card_play` | Card click (hand / combo) |
| `draw_card` | Player draw at turn start |
| `resource_gain` | Shield / barrier gained on impact |
| `partial_reveal` | Attack blocked by shield/barrier |
| `end_turn` | End turn (battle + exploration) |
| `modal_open` | Result / encounter modal |
| `dice_roll` | Encounter modal (fate beat) |
| `success_reveal` / `failure_reveal` | Victory / defeat modal |
| `event_sting` | Exploration encounter |
| `button_hover` | Generic UI hover hook |
| `warning_sting` | Reserved (procedural) |

Beds / stings without files under `public/audio` use procedural loops (`base_ambient`, danger layers, game-over suite).

## Atmosphere

`computeAtmosphereFromBattle` maps player/enemy HP ratios + poison → `AtmosphereProfile`:

- Low player HP → danger / collapse layers
- High fear (missing HP) → ambience drone / crackle
- Victory / defeat → game-over suite via `useGameOverAudio`

## Settings

`localStorage` key: `dfcg-audio-settings-v1`

- master / music / SFX volumes
- mute toggle

## Preload

1. Unlock → `ui` + `event` one-shots
2. +2s → music + ambience loops (lazy; missing files → procedural once)

## Usage

```tsx
const { play, unlocked, unlock } = useAudio();
play('card_play');

useGameAudio({ phase: 'battle', playerHp, playerMaxHp, enemyHp, enemyMaxHp, ... });
useGameOverAudio(isVictory ? 'victory' : isDefeat ? 'defeat' : null);

<AudioProvider><App /></AudioProvider>
<AudioSettings />
```

Add OGG/MP3/WAV under `public/audio/` matching `soundManifest.ts` to replace procedural beds.

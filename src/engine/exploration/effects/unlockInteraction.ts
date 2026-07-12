import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation, discoverLocation } from '../map';
import { appendExplorationLog } from '../log';

export const unlockInteractionHandler: ExplorationEffectHandler = (_effect, ctx) => {
  const location = getCurrentLocation(ctx.exploration);
  const interaction = location.interactions.find((item) => item.id === ctx.interactionId);
  if (!interaction) {
    return ctx.exploration;
  }
  if (interaction.locked) {
    interaction.locked = false;
    appendExplorationLog(ctx.exploration, `${interaction.label} is no longer sealed.`, 'loot');
  }
  if (interaction.unlocksLocationId) {
    discoverLocation(ctx.exploration, interaction.unlocksLocationId);
    const unlocked = ctx.exploration.locations[interaction.unlocksLocationId];
    if (unlocked) {
      appendExplorationLog(ctx.exploration, `${unlocked.name} is now accessible.`, 'loot');
    }
  }
  if (interaction.id === 'open_gate' || location.id === 'exit_gate') {
    ctx.exploration.flags.exitUnlocked = true;
    appendExplorationLog(ctx.exploration, 'The Exit Gate lock yields.', 'loot');
  }
  if (ctx.exploration.flags.master_key || location.loot.some((l) => l.id === 'master_key' && l.claimed)) {
    ctx.exploration.flags.master_key = true;
  }
  return ctx.exploration;
};

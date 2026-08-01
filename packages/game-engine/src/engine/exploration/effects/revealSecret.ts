import type { ExplorationEffectHandler } from '@/types/explorationEffect';
import { getCurrentLocation, revealSecretConnections } from '../map';
import { appendExplorationLog } from '../log';

export const revealSecretHandler: ExplorationEffectHandler = (_effect, ctx) => {
  const before = Object.values(ctx.exploration.locations).filter((l) => l.secret && l.discovered)
    .length;
  revealSecretConnections(ctx.exploration);
  const interaction = getCurrentLocation(ctx.exploration).interactions.find(
    (item) => item.id === ctx.interactionId,
  );
  if (interaction?.unlocksLocationId) {
    const secret = ctx.exploration.locations[interaction.unlocksLocationId];
    if (secret) {
      secret.discovered = true;
      appendExplorationLog(ctx.exploration, `You uncover a path to ${secret.name}.`, 'loot');
      return ctx.exploration;
    }
  }
  const after = Object.values(ctx.exploration.locations).filter((l) => l.secret && l.discovered)
    .length;
  if (after > before) {
    appendExplorationLog(ctx.exploration, 'A hidden passage reveals itself.', 'loot');
  }
  return ctx.exploration;
};

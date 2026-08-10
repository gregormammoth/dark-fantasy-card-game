import type {
  ExplorationContext,
  NpcShopService,
  ShopServiceEffect,
} from '@dark-fantasy/shared/types/exploration';
import { appendExplorationLog } from './log';

export function normalizeMoney(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

export function grantMoney(context: ExplorationContext, amount: number): ExplorationContext {
  const gain = Math.max(0, Math.floor(amount));
  if (gain <= 0) {
    return context;
  }
  context.money = normalizeMoney(context.money) + gain;
  appendExplorationLog(
    context,
    `Gained ${gain} crown${gain === 1 ? '' : 's'} (${context.money} total).`,
    'loot',
  );
  return context;
}

export function findShopService(
  context: ExplorationContext,
  locationId: string,
  npcId: string,
  serviceId: string,
): NpcShopService | null {
  const npc = context.locations[locationId]?.npcs.find((entry) => entry.id === npcId);
  return npc?.shopServices?.find((service) => service.id === serviceId) ?? null;
}

export function canBuyShopService(
  context: ExplorationContext,
  service: NpcShopService,
): boolean {
  if (normalizeMoney(context.money) < service.cost) {
    return false;
  }
  if (service.effect === 'restoreShield') {
    return context.shield < context.maxShield;
  }
  if (service.effect === 'restoreMana') {
    return context.mana < context.maxMana;
  }
  return false;
}

function applyShopEffect(context: ExplorationContext, effect: ShopServiceEffect): void {
  if (effect === 'restoreShield') {
    context.shield = context.maxShield;
    appendExplorationLog(
      context,
      `Your shield is restored (${context.shield}/${context.maxShield}).`,
      'action',
    );
    return;
  }
  context.mana = context.maxMana;
  appendExplorationLog(
    context,
    `Your mana is restored (${context.mana}/${context.maxMana}).`,
    'action',
  );
}

export function buyShopService(
  context: ExplorationContext,
  locationId: string,
  npcId: string,
  serviceId: string,
): ExplorationContext {
  const service = findShopService(context, locationId, npcId, serviceId);
  if (!service || !canBuyShopService(context, service)) {
    return context;
  }
  context.money = normalizeMoney(context.money) - service.cost;
  applyShopEffect(context, service.effect);
  appendExplorationLog(
    context,
    `Paid ${service.cost} crown${service.cost === 1 ? '' : 's'} (${context.money} left).`,
    'loot',
  );
  return context;
}

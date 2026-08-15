import type { ExplorationContext, ExplorationLogEntry } from '@dark-fantasy/shared/types/exploration';

let logCounter = 0;

export function resetExplorationLogCounter(): void {
  logCounter = 0;
}

export function syncExplorationLogCounter(log: ExplorationLogEntry[]): void {
  logCounter = log.reduce((max, entry) => Math.max(max, entry.id), 0);
}

export function appendExplorationLog(
  context: ExplorationContext,
  message: string,
  kind: ExplorationLogEntry['kind'] = 'system',
  options?: {
    messageKey?: string;
    params?: Record<string, string | number>;
  },
): void {
  syncExplorationLogCounter(context.log);
  logCounter += 1;
  context.log.push({
    id: logCounter,
    message,
    kind,
    messageKey: options?.messageKey,
    params: options?.params,
  });
  if (context.log.length > 40) {
    context.log.splice(0, context.log.length - 40);
  }
}

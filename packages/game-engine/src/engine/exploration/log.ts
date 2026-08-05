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
): void {
  syncExplorationLogCounter(context.log);
  logCounter += 1;
  context.log.push({
    id: logCounter,
    message,
    kind,
  });
  if (context.log.length > 40) {
    context.log.splice(0, context.log.length - 40);
  }
}

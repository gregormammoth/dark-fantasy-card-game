import { apiFetch } from '@/lib/api';

export type AnalyticsEventName =
  | 'player_created'
  | 'session_started'
  | 'battle_started'
  | 'battle_finished'
  | 'card_unlocked'
  | 'run_abandoned'
  | 'escape_to_world';

export function trackEvent(
  name: AnalyticsEventName,
  playerId: string | null,
  payload?: Record<string, unknown>,
): void {
  void apiFetch('/analytics/events', {
    method: 'POST',
    body: JSON.stringify({
      name,
      playerId,
      payload: payload ?? null,
    }),
  }).catch(() => undefined);
}

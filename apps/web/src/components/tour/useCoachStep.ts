'use client';

import { useCallback, useState } from 'react';
import { isStepSeen, markStepSeen, type TourStep } from '@/lib/tour';

export function useCoachStep(playerId: string, step: TourStep, active: boolean) {
  const [seen, setSeen] = useState(() => isStepSeen(playerId, step));

  const dismiss = useCallback(() => {
    markStepSeen(playerId, step);
    setSeen(true);
  }, [playerId, step]);

  return { show: active && !seen, dismiss };
}

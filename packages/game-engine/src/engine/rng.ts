import type { RngState } from '@dark-fantasy/shared/types/rng';
import { nextInt } from '@dark-fantasy/shared/types/rng';

export {
  cloneRng,
  createRng,
  nextFloat,
  nextInt,
  nextUint,
  normalizeSeed,
} from '@dark-fantasy/shared/types/rng';
export type { RngState } from '@dark-fantasy/shared/types/rng';

export function shuffle<T>(array: T[], rng: RngState): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = nextInt(rng, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface RngState {
  seed: number;
  cursor: number;
}

export function normalizeSeed(seed: number): number {
  return seed >>> 0;
}

export function createRng(seed?: number): RngState {
  const value =
    seed === undefined || Number.isNaN(seed) ? (Date.now() >>> 0) : normalizeSeed(seed);
  return { seed: value, cursor: 0 };
}

export function cloneRng(rng: RngState): RngState {
  return { seed: rng.seed, cursor: rng.cursor };
}

export function nextUint(rng: RngState): number {
  rng.cursor += 1;
  let t = (rng.seed + Math.imul(rng.cursor, 0x9e3779b9)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

export function nextFloat(rng: RngState): number {
  return nextUint(rng) / 4294967296;
}

export function nextInt(rng: RngState, maxExclusive: number): number {
  if (maxExclusive <= 0) {
    return 0;
  }
  return Math.floor(nextFloat(rng) * maxExclusive);
}

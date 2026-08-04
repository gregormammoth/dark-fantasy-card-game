/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createRng, nextInt, shuffle } from './rng';

describe('seeded rng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = Array.from({ length: 20 }, () => nextInt(a, 1000));
    const seqB = Array.from({ length: 20 }, () => nextInt(b, 1000));
    expect(seqA).toEqual(seqB);
  });

  it('diverges for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 10 }, () => nextInt(a, 1000));
    const seqB = Array.from({ length: 10 }, () => nextInt(b, 1000));
    expect(seqA).not.toEqual(seqB);
  });

  it('shuffles deterministically', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(shuffle(input, createRng(99))).toEqual(shuffle(input, createRng(99)));
    expect(shuffle(input, createRng(99))).not.toEqual(shuffle(input, createRng(100)));
  });
});

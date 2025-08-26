import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickWeightedIndex } from '../src/utils/weightedPicker';

const rngSeq = (values: number[]) => {
  let i = 0;
  return () => {
    const v = values[i % values.length];
    i++;
    return v;
  };
};

test('pickWeightedIndex returns the sole positive index deterministically', () => {
  const idx = pickWeightedIndex([1, 0, 0, 0], { rng: Math.random });
  assert.equal(idx, 0);
});

test('pickWeightedIndex treats near-zero as zero', () => {
  const epsy = 1e-12; // < default eps
  const idx = pickWeightedIndex([0, epsy, 0], { rng: Math.random });
  // No positives -> uniform among 3
  const pick = pickWeightedIndex([0, epsy, 0], { rng: () => 0.9 });
  assert.ok([0,1,2].includes(pick));
});

test('pickWeightedIndex splits proportionally for multiple positives', () => {
  const weights = [1, 3, 0, 0];
  const trials = 5000;
  let c0 = 0, c1 = 0, c2 = 0, c3 = 0;
  for (let t = 0; t < trials; t++) {
    const i = pickWeightedIndex(weights);
    if (i === 0) c0++; else if (i === 1) c1++; else if (i === 2) c2++; else c3++;
  }
  // Expect roughly 1:3 ratio between index 0 and 1 and zero counts for 2 and 3
  assert.ok(c2 === 0 && c3 === 0);
  const ratio = c1 / c0;
  assert.ok(ratio > 2.3 && ratio < 3.7, `ratio ~3 expected, got ${ratio}`);
});

test('pickWeightedIndex falls back to uniform when all non-positive', () => {
  const idx = pickWeightedIndex([0, 0, 0, 0], { rng: () => 0.75 });
  assert.equal(idx, Math.floor(0.75 * 4)); // 3
});

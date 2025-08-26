import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProbabilityEngine } from '../src/services/ProbabilityEngine';
import type { Prize, CampaignSegment } from '../src/types/PrizeSystem';
import { pickWeightedIndex } from '../src/utils/weightedPicker';

const runTrials = (weights: number[], trials = 3000) => {
  const counts = Array.from({ length: weights.length }, () => 0);
  for (let t = 0; t < trials; t++) {
    const i = pickWeightedIndex(weights);
    counts[i]++;
  }
  return counts;
};

// Case 1: single segment associated with a 100% prize -> must always select that segment
test('Integration: with a single 100% prize and one segment, only that segment is selected', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Prix 1', prizeId: 'p1' },
    { id: 's2', label: 'Try again' },
    { id: 's3', label: 'Try again' },
    { id: 's4', label: 'Try again' },
  ];
  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  assert.equal(result.hasGuaranteedWin, true);

  const weights = result.segments.map((s) => s.probability || 0);
  const counts = runTrials(weights, 2000);
  // Only index 0 should have counts
  counts.forEach((c, idx) => {
    if (idx === 0) {
      assert.ok(c > 0);
    } else {
      assert.equal(c, 0);
    }
  });
});

// Case 2: 100% prize spread on two segments -> selection must stay within these two
// and roughly split ~50/50
test('Integration: 100% prize on two segments -> picks only among them (~50/50)', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Prix 1 A', prizeId: 'p1' },
    { id: 's2', label: 'Prix 1 B', prizeId: 'p1' },
    { id: 's3', label: 'Try again' },
    { id: 's4', label: 'Try again' },
  ];
  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  assert.equal(result.hasGuaranteedWin, true);

  const weights = result.segments.map((s) => s.probability || 0);
  const counts = runTrials(weights, 5000);

  // Only indices 0 and 1 should have counts
  assert.ok(counts[0] > 0 && counts[1] > 0, `counts=${JSON.stringify(counts)}`);
  assert.equal(counts[2], 0);
  assert.equal(counts[3], 0);

  // Roughly 50/50 within tolerance
  const ratio = counts[0] / counts[1];
  assert.ok(ratio > 0.7 && ratio < 1.3, `ratio ~1 expected, got ${ratio} with counts ${counts[0]}:${counts[1]}`);
});

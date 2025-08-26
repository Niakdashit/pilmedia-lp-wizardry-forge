import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProbabilityEngine } from '../src/services/ProbabilityEngine';
import type { Prize, CampaignSegment } from '../src/types/PrizeSystem';

test('ProbabilityEngine - assigns 100% exclusively to the segments of a single 100% prize', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'A', prizeId: 'p1' },
    { id: 's2', label: 'B' },
    { id: 's3', label: 'C' },
    { id: 's4', label: 'D' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
    { id: 'p2', name: 'Prix 2', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 0 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  assert.equal(result.hasGuaranteedWin, true);
  assert.equal(result.totalProbability, 100);

  const probs = result.segments.map((s) => s.probability);
  assert.ok(Math.abs(probs[0] - 100) < 1e-6);
  assert.ok(probs.slice(1).every((p) => p === 0));

  const winners = result.segments.filter((s) => s.isWinning);
  assert.equal(winners.length, 1);
  assert.equal(winners[0].id, 's1');
});

test('ProbabilityEngine - splits 100% across multiple segments of the same 100% prize', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'A', prizeId: 'p1' },
    { id: 's2', label: 'B', prizeId: 'p1' },
    { id: 's3', label: 'C' },
    { id: 's4', label: 'D' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const probs = result.segments.map((s) => s.probability);
  assert.equal(result.hasGuaranteedWin, true);
  assert.ok(Math.abs(probs[0] - 50) < 1e-6);
  assert.ok(Math.abs(probs[1] - 50) < 1e-6);
  assert.ok(Math.abs(probs[2] - 0) < 1e-6);
  assert.ok(Math.abs(probs[3] - 0) < 1e-6);

  const winners = result.segments.filter((s) => s.isWinning);
  assert.equal(winners.length, 2);
});

test('ProbabilityEngine - splits 100% across multiple prizes each at 100%, proportional to their segment counts', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'A', prizeId: 'p1' }, // p1 has 1 seg
    { id: 's2', label: 'B', prizeId: 'p2' }, // p2 has 2 segs
    { id: 's3', label: 'C', prizeId: 'p2' },
    { id: 's4', label: 'D' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
    { id: 'p2', name: 'Prix 2', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  assert.equal(result.hasGuaranteedWin, true);
  // Each prize gets 50; p1 has 1 seg => 50; p2 has 2 segs => 25 each
  const probs = result.segments.map((s) => s.probability);
  assert.ok(Math.abs(probs[0] - 50) < 1e-6);
  assert.ok(Math.abs(probs[1] - 25) < 1e-6);
  assert.ok(Math.abs(probs[2] - 25) < 1e-6);
  assert.ok(Math.abs(probs[3] - 0) < 1e-6);
});

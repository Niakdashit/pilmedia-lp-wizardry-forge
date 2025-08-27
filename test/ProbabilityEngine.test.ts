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

test('ProbabilityEngine - applies manual probabilities to losing segments and distributes residual to remaining losing segments', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Win', prizeId: 'p1' },
    { id: 's2', label: 'Lose M', manualProbabilityPercent: 20 },
    { id: 's3', label: 'Lose A' },
    { id: 's4', label: 'Lose B' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prize A', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 40 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const p = result.segments.map(s => s.probability);
  // Winners: 40 on s1; manual 20 on s2; residual 40 split over s3 and s4 => 20 each
  assert.ok(Math.abs(p[0] - 40) < 1e-6);
  assert.ok(Math.abs(p[1] - 20) < 1e-6);
  assert.ok(Math.abs(p[2] - 20) < 1e-6);
  assert.ok(Math.abs(p[3] - 20) < 1e-6);
  assert.equal(result.hasGuaranteedWin, false);
  assert.ok(Math.abs(result.residualProbability - 40) < 1e-6);
});

test('ProbabilityEngine - normalizes when winners + manual exceed 100', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Win', prizeId: 'p1' },
    { id: 's2', label: 'Lose M', manualProbabilityPercent: 40 },
    { id: 's3', label: 'Lose Z' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prize A', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 80 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const p = result.segments.map(s => s.probability);
  // combined = 80 + 40 = 120 => factor = 100/120 = 0.833333...
  assert.ok(Math.abs(p[0] - (80 * (100/120))) < 1e-6); // ~66.6667
  assert.ok(Math.abs(p[1] - (40 * (100/120))) < 1e-6); // ~33.3333
  assert.ok(Math.abs(p[2] - 0) < 1e-6); // no residual when >100
  assert.equal(result.hasGuaranteedWin, false);
  assert.ok(Math.abs(result.residualProbability - 0) < 1e-6);
});

test('ProbabilityEngine - guaranteed 100% prize overrides manual losing probabilities', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Win', prizeId: 'p1' },
    { id: 's2', label: 'Lose M', manualProbabilityPercent: 30 },
    { id: 's3', label: 'Lose Z' },
  ];

  const prizes: Prize[] = [
    { id: 'p1', name: 'Prix 1', totalUnits: 10, awardedUnits: 0, method: 'probability', probabilityPercent: 100 },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const p = result.segments.map(s => s.probability);
  assert.equal(result.hasGuaranteedWin, true);
  assert.ok(Math.abs(p[0] - 100) < 1e-6);
  assert.ok(Math.abs(p[1] - 0) < 1e-6);
  assert.ok(Math.abs(p[2] - 0) < 1e-6);
});

test('ProbabilityEngine - manual only (no prizes): manual values + residual equally among others', () => {
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Lose M1', manualProbabilityPercent: 10 },
    { id: 's2', label: 'Lose A' },
    { id: 's3', label: 'Lose B' },
  ];

  const prizes: Prize[] = [];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const p = result.segments.map(s => s.probability);
  // residual = 90 split over s2 and s3 => 45 each
  assert.ok(Math.abs(p[0] - 10) < 1e-6);
  assert.ok(Math.abs(p[1] - 45) < 1e-6);
  assert.ok(Math.abs(p[2] - 45) < 1e-6);
  assert.equal(result.hasGuaranteedWin, false);
  assert.ok(Math.abs(result.residualProbability - 90) < 1e-6);
});

test('ProbabilityEngine - active calendar prizes take 100% and ignore manual values', () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const startDate = `${yyyy}-${mm}-${dd}`;
  const endDate = `${yyyy}-${mm}-${dd}`;
  // Start 00:00 to End 23:59 to ensure active today
  const segments: CampaignSegment[] = [
    { id: 's1', label: 'Cal A', prizeId: 'c1' },
    { id: 's2', label: 'Lose M', manualProbabilityPercent: 30 },
    { id: 's3', label: 'Lose Z' },
  ];

  const prizes: Prize[] = [
    { id: 'c1', name: 'Calendar 1', totalUnits: 10, awardedUnits: 0, method: 'calendar', startDate, endDate, startTime: '00:00', endTime: '23:59' },
  ];

  const result = ProbabilityEngine.calculateSegmentProbabilities(segments, prizes);
  const p = result.segments.map(s => s.probability);
  // 100% goes to active calendar prize segments; others 0
  assert.equal(result.hasGuaranteedWin, true);
  assert.ok(Math.abs(p[0] - 100) < 1e-6);
  assert.ok(Math.abs(p[1] - 0) < 1e-6);
  assert.ok(Math.abs(p[2] - 0) < 1e-6);
});

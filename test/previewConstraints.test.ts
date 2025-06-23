import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateConstrainedSize, GAME_CONSTRAINTS } from '../src/components/QuickCampaign/Preview/utils/previewConstraints';

test('calculateConstrainedSize allows larger wheel size', () => {
  const result = calculateConstrainedSize(600, 600, 'wheel');
  assert.equal(result.width, GAME_CONSTRAINTS.wheel.maxSize);
  assert.equal(result.height, GAME_CONSTRAINTS.wheel.maxSize);
});

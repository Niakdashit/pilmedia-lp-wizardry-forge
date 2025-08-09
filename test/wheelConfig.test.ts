import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWheelSegments, getWheelDimensions } from '../src/utils/wheelConfig';

test('getWheelSegments fills missing colors', () => {
  const campaign = {
    config: {
      roulette: {
        segments: [{ label: 'A' }, { label: 'B' }],
        segmentColor1: '#111111',
        segmentColor2: '#222222'
      }
    },
    design: {
      background: { type: 'color', value: '#000000' }
    }
  };
  const segments = getWheelSegments(campaign);
  assert.equal(segments[0].color, '#111111');
  assert.equal(segments[1].color, '#ffffff');
  assert.equal(segments[0].textColor, '#ffffff');
  assert.equal(segments[1].textColor, '#111111');
});

test('getWheelDimensions returns expected pointer size', () => {
  const dims = getWheelDimensions({ width: 300, height: 300 }, 'center', false);
  assert.ok(dims.pointerSize >= 30);
});

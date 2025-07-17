import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSegments } from '../src/components/QualifioEditor/Preview/wheelHelpers';

const baseConfig: any = { wheelSegments: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] };

const brandColor = '#123456';

test('createSegments returns even count', () => {
  const result = createSegments(baseConfig, brandColor);
  assert.equal(result.length % 2, 0);
});

test('createSegments alternates colors starting with brandColor', () => {
  const result = createSegments(baseConfig, brandColor);
  result.forEach((seg, idx) => {
    const expected = idx % 2 === 0 ? brandColor : '#ffffff';
    assert.equal(seg.color, expected);
  });
});

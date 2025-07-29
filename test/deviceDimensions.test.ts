import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_DEVICE_DIMENSIONS, getDeviceDimensions } from '../src/utils/deviceDimensions';

test('getDeviceDimensions matches constants', () => {
  (['desktop','tablet','mobile'] as const).forEach(device => {
    assert.deepEqual(getDeviceDimensions(device), STANDARD_DEVICE_DIMENSIONS[device]);
  });
});

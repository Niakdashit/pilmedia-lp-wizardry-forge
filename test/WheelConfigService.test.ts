import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WheelConfigService } from '../src/services/WheelConfigService';

const makeSegments = (n: number) => Array.from({ length: n }, (_, i) => ({ id: String(i + 1), label: `S${i + 1}` }));

// Helper to normalize hex
const norm = (c: string) => c.trim().toLowerCase().replace(/^#?/, '#');

test('getCanonicalWheelConfig forces secondary to white and alternation uses primary/white', () => {
  const primary = '#841b60';
  const extracted = ['#123456', '#00ff00', '#abcdef']; // secondary extracted should be ignored
  const campaign: any = {
    id: 'cmp-1',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { borderColor: primary },
    },
    gameConfig: {
      wheel: {
        segments: makeSegments(8)
      }
    }
  };

  const wheelConfig = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'desktop' });
 
  // secondary is forced to white in canonical config
  assert.equal(norm(wheelConfig.customColors?.secondary || ''), '#ffffff');
  assert.equal(norm(wheelConfig.brandColors?.secondary || ''), '#ffffff');

  const segs = WheelConfigService.getStandardizedSegments(wheelConfig);
  assert.equal(segs.length, 8);

  const prim = norm(wheelConfig.customColors?.primary || wheelConfig.brandColors?.primary || '');
  // Even indices = primary, odd indices = white
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim, `index ${idx} should be primary`);
    } else {
      assert.equal(c, '#ffffff', `index ${idx} should be white`);
    }
  });
});

test('getStandardizedSegments forces secondary to white if equal to primary (direct call)', () => {
  const config: any = {
    customColors: { primary: '#222222', secondary: '#222222' },
    brandColors: {},
    segments: makeSegments(6),
    size: 200,
  };
  const segs = WheelConfigService.getStandardizedSegments(config);
  assert.equal(segs.length, 6);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, '#222222');
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

test('odd segment count gets auto-spacer to enforce perfect alternation', () => {
  const config: any = {
    customColors: { primary: '#111111', secondary: '#ffffff' },
    brandColors: {},
    segments: makeSegments(5),
    size: 200,
  };
  const segs = WheelConfigService.getStandardizedSegments(config);
  // Should append one spacer => total 6
  assert.equal(segs.length, 6);
  // Check last has id or label handled; color pattern must be correct
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, '#111111');
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

test('near-white extracted primary falls back to borderColor', () => {
  const campaign: any = {
    id: 'cmp-2',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { borderColor: '#aa2244' }
    },
    gameConfig: { wheel: { segments: makeSegments(6) } }
  };
  const extracted = ['#ffffff'];
  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'desktop' });
  const prim = norm(cfg.customColors?.primary || cfg.brandColors?.primary || '');
  assert.equal(prim, norm('#aa2244'));

  const segs = WheelConfigService.getStandardizedSegments(cfg);
  assert.equal(segs.length, 6);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim);
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

test('near-white extracted without borderColor falls back to defaults', () => {
  const campaign: any = {
    id: 'cmp-3',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { }
    },
    gameConfig: { wheel: { segments: makeSegments(4) } }
  };
  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, ['#fefefe'], {}, { device: 'desktop' });
  const prim = norm(cfg.customColors?.primary || cfg.brandColors?.primary || '');
  // default primary/border color in service is #841b60
  assert.equal(prim, norm('#841b60'));

  const segs = WheelConfigService.getStandardizedSegments(cfg);
  assert.equal(segs.length, 4);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim);
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

// --- Additional tests for rgb/rgba normalization and near-white guard ---
test('rgb extracted near-white falls back to borderColor and alternation preserved', () => {
  const campaign: any = {
    id: 'cmp-rgb-1',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { borderColor: '#aa2244' }
    },
    gameConfig: { wheel: { segments: makeSegments(6) } }
  };
  const extracted = ['rgb(255, 255, 255)'];
  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'desktop' });
  const prim = norm(cfg.customColors?.primary || cfg.brandColors?.primary || '');
  // should choose border color because extracted near-white
  assert.equal(prim, norm('#aa2244'));

  const segs = WheelConfigService.getStandardizedSegments(cfg);
  assert.equal(segs.length, 6);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim);
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

test('rgba extracted near-white falls back to default border when none provided', () => {
  const campaign: any = {
    id: 'cmp-rgba-1',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { }
    },
    gameConfig: { wheel: { segments: makeSegments(4) } }
  };
  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, ['rgba(250, 250, 250, 0.9)'], {}, { device: 'desktop' });
  const prim = norm(cfg.customColors?.primary || cfg.brandColors?.primary || '');
  assert.equal(prim, norm('#841b60'));

  const segs = WheelConfigService.getStandardizedSegments(cfg);
  assert.equal(segs.length, 4);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim);
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

test('rgb extracted non-white is used as primary (alternation with white)', () => {
  const campaign: any = {
    id: 'cmp-rgb-2',
    design: {
      background: { type: 'image', url: 'x' },
      wheelConfig: { borderColor: '#aa2244' }
    },
    gameConfig: { wheel: { segments: makeSegments(6) } }
  };
  const extracted = ['rgb(10, 20, 30)'];
  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'desktop' });
  const prim = norm(cfg.customColors?.primary || cfg.brandColors?.primary || '');
  // prim should be the rgb converted to hex => #0a141e
  assert.equal(prim, '#0a141e');

  const segs = WheelConfigService.getStandardizedSegments(cfg);
  assert.equal(segs.length, 6);
  segs.forEach((s, idx) => {
    const c = norm(s.color);
    if (idx % 2 === 0) {
      assert.equal(c, prim);
    } else {
      assert.equal(c, '#ffffff');
    }
  });
});

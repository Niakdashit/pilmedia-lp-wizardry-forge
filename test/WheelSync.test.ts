import test from 'node:test';
import assert from 'node:assert/strict';

import { WheelConfigService } from '../src/services/WheelConfigService';

test('Wheel standardized segments are identical across desktop and mobile for same campaign data', () => {
  const campaign: any = {
    id: 'cmp-1',
    design: {
      background: { type: 'image', url: '/bg.jpg' },
      extractedColors: ['#3366ff', '#eeeeee', '#ff9933'],
      wheelConfig: {
        borderStyle: 'classic',
        borderColor: '#123456',
        borderWidth: 10,
        scale: 1,
        showBulbs: true,
        position: 'center'
      },
      brandColors: { accent: '#00cc99' }
    },
    gameConfig: {
      wheel: {
        segments: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
          { id: 'd', label: 'D' },
          { id: 'e', label: 'E' },
          { id: 'f', label: 'F' }
        ],
        mode: 'random',
        speed: 'medium',
        winProbability: 0.5
      }
    },
    config: { roulette: {} }
  };

  const extracted = campaign.design.extractedColors;

  const desktopCfg = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'desktop', shouldCropWheel: true });
  const mobileCfg = WheelConfigService.getCanonicalWheelConfig(campaign, extracted, {}, { device: 'mobile', shouldCropWheel: false });

  // Border color must match (primary derived from extractedColors[0])
  assert.equal(desktopCfg.borderColor.toLowerCase(), '#3366ff');
  assert.equal(mobileCfg.borderColor.toLowerCase(), '#3366ff');

  const deskSegs = WheelConfigService.getStandardizedSegments(desktopCfg);
  const mobSegs = WheelConfigService.getStandardizedSegments(mobileCfg);

  // Compare labels and colors order
  const toShape = (segs: any[]) => segs.map((s) => ({ label: s.label, color: s.color.toLowerCase(), textColor: (s.textColor || '').toLowerCase() }));
  assert.deepEqual(toShape(deskSegs), toShape(mobSegs));
});


test('WheelConfigService enforces strict two-color alternation and even segment count', () => {
  const campaign: any = {
    id: 'cmp-2',
    design: {
      background: { type: 'image', url: '/bg.jpg' },
      extractedColors: ['#ff0000'],
      wheelConfig: { borderColor: '#222222' }
    },
    gameConfig: {
      wheel: {
        segments: [
          { id: '1', label: 'One' },
          { id: '2', label: 'Two' },
          { id: '3', label: 'Three' } // odd count -> service should pad to even
        ]
      }
    }
  };

  const cfg = WheelConfigService.getCanonicalWheelConfig(campaign, campaign.design.extractedColors, {}, { device: 'desktop' });
  const segs = WheelConfigService.getStandardizedSegments(cfg);

  // Even number ensured
  assert.equal(segs.length % 2, 0);

  // Strict alternation between primary and white
  const colors = segs.map((s) => s.color.toLowerCase());
  const primary = '#ff0000';
  const secondary = '#ffffff';
  colors.forEach((c, i) => {
    const expected = i % 2 === 0 ? primary : secondary;
    assert.equal(c, expected);
  });
});

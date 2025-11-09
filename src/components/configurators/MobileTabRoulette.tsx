import React, { useState } from 'react';
import { getThemeColors } from './MobileTabRoulette/themeUtils';
import SegmentEditor from './MobileTabRoulette/SegmentEditor';
import ColorControls from './MobileTabRoulette/ColorControls';
import ThemeSelector from './MobileTabRoulette/ThemeSelector';

interface Segment {
  label: string;
  chance: number;
  color?: string;
  image?: File | null;
}

interface MobileTabRouletteProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const MobileTabRoulette: React.FC<MobileTabRouletteProps> = ({
  campaign,
  setCampaign
}) => {
  const mobileRouletteConfig = campaign.mobileConfig?.roulette || {};
  const [segments, setSegments] = useState<Segment[]>(mobileRouletteConfig.segments || []);
  const [centerImage, setCenterImage] = useState<File | null>(mobileRouletteConfig.centerImage || null);
  const [desiredCount, setDesiredCount] = useState<number>(segments.length || 3);
  const [theme, setTheme] = useState<'default' | 'promo' | 'food' | 'casino' | 'child' | 'gaming' | 'luxury' | 'halloween' | 'noel'>(mobileRouletteConfig.theme || 'default');
  const [borderColor, setBorderColor] = useState<string>(mobileRouletteConfig.borderColor || '#44444d');
  const [pointerColor, setPointerColor] = useState<string>(mobileRouletteConfig.pointerColor || '#44444d');

  const updateMobileRouletteConfig = (newSegments: Segment[], center: File | null, newTheme?: string, newBorderColor?: string, newPointerColor?: string) => {
    setSegments(newSegments);
    setCenterImage(center);
    setCampaign((prev: any) => ({
      ...prev,
      mobileConfig: {
        ...prev.mobileConfig,
        roulette: {
          ...prev.mobileConfig?.roulette,
          segments: newSegments,
          centerImage: center || null,
          theme: newTheme || theme,
          borderColor: newBorderColor || borderColor,
          pointerColor: newPointerColor || pointerColor
        }
      }
    }));
  };

  const handleSegmentChange = (index: number, field: keyof Segment, value: string | number) => {
    const updated = [...segments];
    if (field === 'chance') {
      (updated[index] as any)[field] = value as number;
    } else if (field === 'label' || field === 'color') {
      (updated[index] as any)[field] = value as string;
    }
    updateMobileRouletteConfig(updated, centerImage);
  };

  const handleImageUpload = (index: number, file: File | null) => {
    const updated = [...segments];
    updated[index].image = file;
    updateMobileRouletteConfig(updated, centerImage);
  };

  const addSegment = () => {
    const themeColors = getThemeColors(theme);
    const newSegment: Segment = {
      label: '',
      chance: 0,
      color: themeColors[segments.length % themeColors.length],
      image: null
    };
    const newSegments = [...segments, newSegment];
    updateMobileRouletteConfig(newSegments, centerImage);
    setDesiredCount(newSegments.length);
  };

  const removeSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    updateMobileRouletteConfig(newSegments, centerImage);
    setDesiredCount(newSegments.length);
  };

  const setSegmentCount = (count: number) => {
    const newSegments: Segment[] = [];
    const themeColors = getThemeColors(theme);
    for (let i = 0; i < count; i++) {
      newSegments.push(segments[i] || {
        label: '',
        chance: 0,
        color: themeColors[i % themeColors.length],
        image: null
      });
    }
    updateMobileRouletteConfig(newSegments, centerImage);
    setDesiredCount(count);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
    updateMobileRouletteConfig(segments, centerImage, newTheme, borderColor, pointerColor);
  };

  const handleBorderColorChange = (newColor: string) => {
    setBorderColor(newColor);
    updateMobileRouletteConfig(segments, centerImage, theme, newColor, pointerColor);
  };

  const handlePointerColorChange = (newColor: string) => {
    setPointerColor(newColor);
    updateMobileRouletteConfig(segments, centerImage, theme, borderColor, newColor);
  };

  return (
    <div className="space-y-8 py-0 my-[24px]">
      <ColorControls
        borderColor={borderColor}
        pointerColor={pointerColor}
        onBorderColorChange={handleBorderColorChange}
        onPointerColorChange={handlePointerColorChange}
      />

      <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />

      <h2 className="text-lg font-semibold">Paramètres des segments mobiles</h2>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Nombre de segments :</label>
        <input
          type="number"
          value={desiredCount}
          onChange={e => setSegmentCount(Number(e.target.value))}
          className="border p-2 rounded w-24"
          min={1}
          max={30}
        />
        <button
          onClick={addSegment}
          className="bg-gradient-to-br from-[#44444d] to-[#44444d] text-white px-4 py-2 rounded shadow"
        >
          + Ajouter un segment
        </button>
      </div>

      <SegmentEditor
        segments={segments}
        onSegmentChange={handleSegmentChange}
        onImageUpload={handleImageUpload}
        onRemoveSegment={removeSegment}
      />
    </div>
  );
};

export default MobileTabRoulette;

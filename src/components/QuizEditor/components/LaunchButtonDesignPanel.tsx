import React, { useMemo, useState, useEffect } from 'react';

interface LaunchButtonDesignPanelProps {
  buttonStyles?: React.CSSProperties;
  buttonText?: string;
  onStyleChange?: (styles: Partial<React.CSSProperties>) => void;
  onTextChange?: (text: string) => void;
  onReset?: () => void;
}

const DEFAULT_BACKGROUND = 'radial-gradient(circle at 0% 0%, #841b60, #b41b60)';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_BOX_SHADOW = '0 12px 30px rgba(132, 27, 96, 0.35)';
const DEFAULT_PADDING = '14px 28px';
const DEFAULT_BORDER_RADIUS = 9999;

const DEFAULT_BUTTON_STYLES: React.CSSProperties = {
  background: DEFAULT_BACKGROUND,
  color: DEFAULT_TEXT_COLOR,
  padding: DEFAULT_PADDING,
  borderRadius: `${DEFAULT_BORDER_RADIUS}px`,
  boxShadow: DEFAULT_BOX_SHADOW,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600
};

const toPxString = (value: number) => `${Math.max(0, Math.round(value))}px`;

const parsePadding = (padding?: React.CSSProperties['padding']): [number, number] => {
  if (!padding || typeof padding !== 'string') {
    return [14, 28];
  }
  const parts = padding.split(' ');
  if (parts.length === 1) {
    const val = parseInt(parts[0].replace('px', ''), 10);
    return [Number.isFinite(val) ? val : 14, Number.isFinite(val) ? val : 28];
  }
  const vertical = parseInt(parts[0].replace('px', ''), 10);
  const horizontal = parseInt(parts[1].replace('px', ''), 10);
  return [Number.isFinite(vertical) ? vertical : 14, Number.isFinite(horizontal) ? horizontal : 28];
};

const parseBorderRadius = (value?: React.CSSProperties['borderRadius']) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace('px', ''));
    if (!Number.isNaN(numeric)) return numeric;
  }
  return DEFAULT_BORDER_RADIUS;
};

const LaunchButtonDesignPanel: React.FC<LaunchButtonDesignPanelProps> = ({
  buttonStyles,
  buttonText = 'Participer',
  onStyleChange,
  onTextChange,
  onReset
}) => {
  if (!onStyleChange && !onTextChange) {
    return null;
  }

  const effectiveStyles = useMemo(() => {
    if (buttonStyles && Object.keys(buttonStyles).length > 0) {
      return buttonStyles;
    }
    return DEFAULT_BUTTON_STYLES;
  }, [buttonStyles]);
  const [backgroundInput, setBackgroundInput] = useState<string>(() => {
    return typeof effectiveStyles.background === 'string'
      ? effectiveStyles.background
      : DEFAULT_BACKGROUND;
  });
  const [textColorInput, setTextColorInput] = useState<string>(() => {
    return typeof effectiveStyles.color === 'string' ? effectiveStyles.color : DEFAULT_TEXT_COLOR;
  });
  const [paddingVertical, paddingHorizontal] = useMemo(() => parsePadding(effectiveStyles.padding), [effectiveStyles.padding]);
  const [verticalPadding, setVerticalPadding] = useState<number>(paddingVertical);
  const [horizontalPadding, setHorizontalPadding] = useState<number>(paddingHorizontal);
  const [borderRadius, setBorderRadius] = useState<number>(() => parseBorderRadius(effectiveStyles.borderRadius));
  const [textValue, setTextValue] = useState<string>(buttonText);

  useEffect(() => {
    if (typeof effectiveStyles.background === 'string') {
      setBackgroundInput(effectiveStyles.background);
    }
  }, [effectiveStyles.background]);

  useEffect(() => {
    if (typeof effectiveStyles.color === 'string') {
      setTextColorInput(effectiveStyles.color);
    }
  }, [effectiveStyles.color]);

  useEffect(() => {
    const [v, h] = parsePadding(effectiveStyles.padding);
    setVerticalPadding(v);
    setHorizontalPadding(h);
  }, [effectiveStyles.padding]);

  useEffect(() => {
    setBorderRadius(parseBorderRadius(effectiveStyles.borderRadius));
  }, [effectiveStyles.borderRadius]);

  useEffect(() => {
    setTextValue(buttonText);
  }, [buttonText]);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    onTextChange?.(value);
  };

  const handleBackgroundChange = (value: string) => {
    setBackgroundInput(value);
    onStyleChange?.({ background: value || DEFAULT_BACKGROUND });
  };

  const handleTextColorChange = (value: string) => {
    setTextColorInput(value);
    onStyleChange?.({ color: value || DEFAULT_TEXT_COLOR });
  };

  const handlePaddingChange = (axis: 'vertical' | 'horizontal', value: number) => {
    const clamped = Math.max(0, Math.min(120, Math.round(value)));
    if (axis === 'vertical') {
      setVerticalPadding(clamped);
      onStyleChange?.({ padding: `${clamped}px ${horizontalPadding}px` });
    } else {
      setHorizontalPadding(clamped);
      onStyleChange?.({ padding: `${verticalPadding}px ${clamped}px` });
    }
  };

  const handleBorderRadiusChange = (value: number) => {
    const clamped = Math.max(0, Math.min(200, Math.round(value)));
    setBorderRadius(clamped);
    onStyleChange?.({ borderRadius: toPxString(clamped) });
  };

  const toggleUppercase = () => {
    const next = effectiveStyles.textTransform === 'uppercase' ? undefined : 'uppercase';
    onStyleChange?.({ textTransform: next });
  };

  const toggleBold = () => {
    const next = effectiveStyles.fontWeight === 700 || effectiveStyles.fontWeight === 'bold' ? 500 : 700;
    onStyleChange?.({ fontWeight: next });
  };

  const toggleShadow = () => {
    const next = effectiveStyles.boxShadow ? undefined : DEFAULT_BOX_SHADOW;
    onStyleChange?.({ boxShadow: next || 'none' });
  };

  const isUppercase = effectiveStyles.textTransform === 'uppercase';
  const isBold = effectiveStyles.fontWeight === 700 || effectiveStyles.fontWeight === 'bold';
  const hasShadow = !!effectiveStyles.boxShadow && effectiveStyles.boxShadow !== 'none';

  return (
    <div className="px-4 pb-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Bouton de lancement</h3>
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => {
              setBackgroundInput(DEFAULT_BACKGROUND);
              setTextColorInput(DEFAULT_TEXT_COLOR);
              setVerticalPadding(14);
              setHorizontalPadding(28);
              setBorderRadius(DEFAULT_BORDER_RADIUS);
              onReset?.();
            }}
          >
            Réinitialiser
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-xs font-medium text-gray-700">
            Libellé du bouton
            <input
              type="text"
              value={textValue}
              onChange={(event) => handleTextChange(event.target.value)}
              placeholder="Participer"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#841b60]/40"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-gray-700">
              Couleur de fond / gradient
              <input
                type="text"
                value={backgroundInput}
                onChange={(event) => handleBackgroundChange(event.target.value)}
                placeholder={DEFAULT_BACKGROUND}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#841b60]/40"
              />
              <input
                type="color"
                value={backgroundInput.startsWith('#') ? backgroundInput : '#841b60'}
                onChange={(event) => handleBackgroundChange(event.target.value)}
                className="mt-2 h-9 w-full cursor-pointer rounded-lg border border-gray-300 bg-transparent"
                aria-label="Choisir une couleur de fond"
              />
            </label>

            <label className="block text-xs font-medium text-gray-700">
              Couleur du texte
              <input
                type="text"
                value={textColorInput}
                onChange={(event) => handleTextColorChange(event.target.value)}
                placeholder={DEFAULT_TEXT_COLOR}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#841b60]/40"
              />
              <input
                type="color"
                value={textColorInput.startsWith('#') ? textColorInput : '#ffffff'}
                onChange={(event) => handleTextColorChange(event.target.value)}
                className="mt-2 h-9 w-full cursor-pointer rounded-lg border border-gray-300 bg-transparent"
                aria-label="Choisir une couleur de texte"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-gray-700">
              Padding vertical
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={verticalPadding}
                onChange={(event) => handlePaddingChange('vertical', Number(event.target.value))}
                className="mt-2 w-full"
              />
              <span className="mt-1 block text-right text-[0.65rem] text-gray-500">{verticalPadding}px</span>
            </label>

            <label className="block text-xs font-medium text-gray-700">
              Padding horizontal
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={horizontalPadding}
                onChange={(event) => handlePaddingChange('horizontal', Number(event.target.value))}
                className="mt-2 w-full"
              />
              <span className="mt-1 block text-right text-[0.65rem] text-gray-500">{horizontalPadding}px</span>
            </label>
          </div>

          <label className="block text-xs font-medium text-gray-700">
            Arrondi des angles
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={borderRadius}
              onChange={(event) => handleBorderRadiusChange(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <span className="mt-1 block text-right text-[0.65rem] text-gray-500">{borderRadius}px</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={toggleUppercase}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                isUppercase ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Majuscules
            </button>
            <button
              type="button"
              onClick={toggleBold}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                isBold ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gras
            </button>
            <button
              type="button"
              onClick={toggleShadow}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                hasShadow ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ombre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchButtonDesignPanel;

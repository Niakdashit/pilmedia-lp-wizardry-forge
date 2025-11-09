import React from 'react';
import { ArrowLeft } from 'lucide-react';
import QuizTemplateSelector from '../components/QuizTemplateSelector';
import { QuizTemplate, quizTemplates } from '../../../types/quizTemplates';

interface QuizConfigPanelProps {
  onBack: () => void;
  quizQuestionCount: number;
  quizTimeLimit: number;
  quizDifficulty: 'easy' | 'medium' | 'hard';
  quizBorderRadius?: number;
  quizWidth?: string;
  quizMobileWidth?: string;
  onQuestionCountChange: (count: number) => void;
  onTimeLimitChange: (time: number) => void;
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onBorderRadiusChange?: (radius: number) => void;
  onQuizWidthChange?: (width: string) => void;
  onQuizMobileWidthChange?: (width: string) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  selectedTemplate?: string;
  onTemplateChange?: (template: QuizTemplate) => void;
  // Style overrides
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  onBackgroundOpacityChange?: (opacity: number) => void;
  onTextColorChange?: (color: string) => void;
  onButtonBackgroundColorChange?: (color: string) => void;
  onButtonTextColorChange?: (color: string) => void;
  onButtonHoverBackgroundColorChange?: (color: string) => void;
  onButtonActiveBackgroundColorChange?: (color: string) => void;
}

const QuizConfigPanel: React.FC<QuizConfigPanelProps> = ({
  onBack,
  // quizQuestionCount, // supprimé de l'UI
  // quizTimeLimit, // segment supprimé
  // quizDifficulty, // supprimé de l'UI
  quizBorderRadius = 12,
  quizWidth = '100%',
  quizMobileWidth = '100%',
  // onQuestionCountChange, // supprimé de l'UI
  // onTimeLimitChange, // segment supprimé
  // onDifficultyChange, // supprimé de l'UI
  onBorderRadiusChange,
  onQuizWidthChange = () => {},
  onQuizMobileWidthChange = () => {},
  selectedDevice = 'desktop',
  selectedTemplate,
  onTemplateChange,
  backgroundColor = '#ffffff',
  backgroundOpacity = 100,
  textColor = '#000000',
  buttonBackgroundColor = '#f3f4f6',
  buttonTextColor = '#000000',
  buttonHoverBackgroundColor = '#9fa4a4',
  buttonActiveBackgroundColor = '#a7acb5',
  onBackgroundColorChange,
  onBackgroundOpacityChange,
  onTextColorChange,
  onButtonBackgroundColorChange,
  onButtonTextColorChange,
  onButtonHoverBackgroundColorChange,
  onButtonActiveBackgroundColorChange
}) => {
  // Inline edit states for value boxes
  const [isEditingOpacity, setIsEditingOpacity] = React.useState(false);
  const [isEditingRadius, setIsEditingRadius] = React.useState(false);
  const [isEditingZoom, setIsEditingZoom] = React.useState(false);

  const activeTemplate = React.useMemo(() => {
    return quizTemplates.find((tpl) => tpl.id === selectedTemplate) || quizTemplates[0];
  }, [selectedTemplate]);
  const desktopWidthValue = React.useMemo(() => activeTemplate?.style?.containerWidth ?? 450, [activeTemplate]);
  const mobileWidthValue = React.useMemo(() => activeTemplate?.style?.containerWidth ?? 450, [activeTemplate]);


  // Permettre la saisie directe au double-clic sur un input range spécifique
  const handleRangeDblClick = (e: React.MouseEvent<HTMLInputElement>, opts?: { kind?: 'percent' | 'px' | 'scale' }) => {
    const input = e.currentTarget;
    const min = Number(input.min || '0');
    const max = Number(input.max || '100');
    const step = Number(input.step || '1');
    const kind = opts?.kind;

    // Valeur courante en affichage utilisateur
    const currentDisplay = (() => {
      if (kind === 'scale') {
        // Afficher en % (scale 1.0 => 100)
        return String(Math.round(Number(input.value || '1') * 100));
      }
      return String(input.value || '');
    })();

    let label = 'Entrer une valeur';
    if (kind === 'percent') label += ` (${min} - ${max}) %`;
    else if (kind === 'px') label += ` (${min} - ${max}) px`;
    else if (kind === 'scale') label += ' (50 - 200) %';
    else label += ` (${min} - ${max})`;

    const raw = window.prompt(label, currentDisplay);
    if (raw == null) return;

    const normalized = raw.replace(/\s+/g, '').replace(',', '.').replace('%', '');
    let num = Number(normalized);
    if (Number.isNaN(num)) return;

    if (kind === 'scale') {
      // Convertir % vers scale
      num = Math.min(200, Math.max(50, num));
      num = num / 100; // 50..200% -> 0.5..2.0
    } else {
      // Clamp min/max générique
      num = Math.min(max, Math.max(min, num));
      if (!Number.isNaN(step) && step > 0) {
        num = Math.round(num / step) * step;
      }
    }

    // Déclencher l'événement React standard
    const synthetic = new Event('input', { bubbles: true });
    input.value = String(num);
    input.dispatchEvent(synthetic);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // Double-clic sur la boîte de valeur (pour % et px)
  // const promptNumber = (label: string, initial: string) => {
  //   const raw = window.prompt(label, initial);
  //   if (raw == null) return null;
  //   const normalized = raw.replace(/\s+/g, '').replace(',', '.').replace('%', '').replace('px', '');
  //   const num = Number(normalized);
  //   return Number.isNaN(num) ? null : num;
  // };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="mr-3 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Configuration Quiz</h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-white">
        {/* Templates Section */}
        <div className="space-y-3">
          <QuizTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={(template) => {
              console.log('🎯 Template selected:', template.id, template.name);
              onTemplateChange?.(template);
            }}
          />
        </div>

        {/* Segment "Nombre de questions" supprimé */}

        {/* Segment "Temps limite (secondes)" supprimé */}

        {/* Segment "Difficulté" supprimé */}

        {/* Colors */}
        <div className="space-y-4">
          {/* Transparence du fond */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Transparence du fond de quiz
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={backgroundOpacity}
                onChange={(e) => {
                  const newOpacity = parseInt(e.target.value);
                  onBackgroundOpacityChange?.(newOpacity);
                  // Émettre un événement pour synchroniser avec TemplatedQuiz
                  const event = new CustomEvent('quizStyleUpdate', {
                    detail: { backgroundOpacity: newOpacity }
                  });
                  window.dispatchEvent(event);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                data-suffix="%"
                aria-label="Transparence (%)"
                onDoubleClick={(e) => handleRangeDblClick(e, { kind: 'percent' })}
                style={{
                  background: `linear-gradient(to right, #44444d 0%, #44444d ${backgroundOpacity}%, #e5e7eb ${backgroundOpacity}%, #e5e7eb 100%)`
                }}
              />
              {isEditingOpacity ? (
                <input
                  type="number"
                  autoFocus
                  defaultValue={backgroundOpacity}
                  min={0}
                  max={100}
                  className="w-[72px] bg-white border border-[#44444d] px-2 py-1 rounded text-sm text-gray-900 text-center outline-none"
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) {
                      const clamped = Math.max(0, Math.min(100, Math.round(val)));
                      onBackgroundOpacityChange?.(clamped);
                    }
                    setIsEditingOpacity(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') { setIsEditingOpacity(false); }
                  }}
                />
              ) : (
                <div
                  className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-sm text-gray-900 min-w-[50px] text-center cursor-text"
                  title="Cliquez ou double-cliquez pour saisir une valeur"
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsEditingOpacity(true)}
                  onDoubleClick={() => setIsEditingOpacity(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingOpacity(true); }}
                >
                  {backgroundOpacity}%
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur de fond du quiz
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={backgroundColor || '#ffffff'}
                onChange={(e) => {
                  const newColor = e.target.value;
                  onBackgroundColorChange?.(newColor);
                  // Émettre un événement pour synchroniser avec TemplatedQuiz
                  const event = new CustomEvent('quizStyleUpdate', {
                    detail: { backgroundColor: newColor }
                  });
                  window.dispatchEvent(event);
                }}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur de fond"
              />
              <input
                type="text"
                value={backgroundColor || ''}
                onChange={(e) => onBackgroundColorChange?.(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur du texte du quiz
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={textColor || '#111111'}
                onChange={(e) => {
                  const newColor = e.target.value;
                  onTextColorChange?.(newColor);
                  // Émettre un événement pour synchroniser avec TemplatedQuiz
                  const event = new CustomEvent('quizStyleUpdate', {
                    detail: { textColor: newColor }
                  });
                  window.dispatchEvent(event);
                }}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur du texte"
              />
              <input
                type="text"
                value={textColor || ''}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                placeholder="#111111"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>

          {/* Bouton - Couleur de fond */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonBackgroundColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  onButtonBackgroundColorChange?.(newColor);
                  // Émettre un événement pour synchroniser avec TemplatedQuiz
                  const event = new CustomEvent('quizStyleUpdate', {
                    detail: { buttonBackgroundColor: newColor }
                  });
                  window.dispatchEvent(event);
                }}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur de fond des boutons"
              />
              <input
                type="text"
                value={buttonBackgroundColor || ''}
                onChange={(e) => onButtonBackgroundColorChange?.(e.target.value)}
                placeholder="#44444d"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>

          {/* Bouton - Couleur du texte */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur du texte des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonTextColor}
                onChange={(e) => {
                  const newColor = e.target.value;
                  onButtonTextColorChange?.(newColor);
                  // Émettre un événement pour synchroniser avec TemplatedQuiz
                  const event = new CustomEvent('quizStyleUpdate', {
                    detail: { buttonTextColor: newColor }
                  });
                  window.dispatchEvent(event);
                }}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur du texte des boutons"
              />
              <input
                type="text"
                value={buttonTextColor || ''}
                onChange={(e) => onButtonTextColorChange?.(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>

          {/* Bouton - Couleur de survol */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur de survol des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonHoverBackgroundColor}
                onChange={(e) => onButtonHoverBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur de survol des boutons"
              />
              <input
                type="text"
                value={buttonHoverBackgroundColor || ''}
                onChange={(e) => onButtonHoverBackgroundColorChange?.(e.target.value)}
                placeholder="#6b1548"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>

          {/* Bouton - Couleur active */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Couleur active des boutons
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={buttonActiveBackgroundColor}
                onChange={(e) => onButtonActiveBackgroundColorChange?.(e.target.value)}
                className="w-10 h-10 rounded-md border border-gray-300 bg-white p-0"
                aria-label="Couleur active des boutons"
              />
              <input
                type="text"
                value={buttonActiveBackgroundColor || ''}
                onChange={(e) => onButtonActiveBackgroundColorChange?.(e.target.value)}
                placeholder="#5a1239"
                className="flex-1 p-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:border-[#44444d] focus:ring-2 focus:ring-[#44444d]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        {onBorderRadiusChange && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Arrondi des coins
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={quizBorderRadius}
                onChange={(e) => onBorderRadiusChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                data-suffix="px"
                aria-label="Arrondi (px)"
                onDoubleClick={(e) => handleRangeDblClick(e, { kind: 'px' })}
                style={{
                  background: `linear-gradient(to right, #44444d 0%, #44444d ${(quizBorderRadius / 50) * 100}%, #e5e7eb ${(quizBorderRadius / 50) * 100}%, #e5e7eb 100%)`
                }}
              />
              {isEditingRadius ? (
                <input
                  type="number"
                  autoFocus
                  defaultValue={quizBorderRadius}
                  min={0}
                  max={50}
                  className="w-[72px] bg-white border border-[#44444d] px-2 py-1 rounded text-sm text-gray-900 text-center outline-none"
                  onBlur={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val)) {
                      const clamped = Math.max(0, Math.min(50, Math.round(val)));
                      onBorderRadiusChange?.(clamped);
                    }
                    setIsEditingRadius(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') { setIsEditingRadius(false); }
                  }}
                />
              ) : (
                <div
                  className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-sm text-gray-900 min-w-[40px] text-center cursor-text"
                  title="Cliquez ou double-cliquez pour saisir une valeur"
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsEditingRadius(true)}
                  onDoubleClick={() => setIsEditingRadius(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingRadius(true); }}
                >
                  {quizBorderRadius}px
                </div>
              )}
            </div>
          </div>
        )}

        {/* Taille du quiz */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">
            Échelle du quiz - {selectedDevice === 'desktop' ? 'Desktop' : selectedDevice === 'tablet' ? 'Tablette' : 'Mobile'}
          </h3>
          
          {/* Desktop/Tablet Zoom Scale */}
          {selectedDevice !== 'mobile' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Zoom Desktop/Tablette
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={(() => {
                    // Convertir la largeur en échelle de zoom (base = largeur du template)
                    if (quizWidth === '100%' || quizWidth === 'auto') return 1;
                    const numValue = parseInt(quizWidth.replace(/px|%/, ''));
                    return isNaN(numValue) || desktopWidthValue <= 0 ? 1 : numValue / desktopWidthValue;
                  })()}
                  onChange={(e) => {
                    const scale = parseFloat(e.target.value);
                    const width = Math.round(scale * desktopWidthValue);
                    onQuizWidthChange(`${width}px`);
                    console.log('Échelle Desktop mise à jour:', scale, '-> Largeur:', `${width}px`);
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  data-suffix="%"
                  aria-label="Zoom (%)"
                  onDoubleClick={(e) => handleRangeDblClick(e, { kind: 'scale' })}
                  style={{
                    background: `linear-gradient(to right, #44444d 0%, #44444d ${(() => {
                      const scale = (() => {
                        if (quizWidth === '100%' || quizWidth === 'auto') return 1;
                        const numValue = parseInt(quizWidth.replace(/px|%/, ''));
                        return isNaN(numValue) || desktopWidthValue <= 0 ? 1 : numValue / desktopWidthValue;
                      })();
                      return ((scale - 0.5) / (2 - 0.5)) * 100;
                    })()}%, #e5e7eb ${(() => {
                      const scale = (() => {
                        if (quizWidth === '100%' || quizWidth === 'auto') return 1;
                        const numValue = parseInt(quizWidth.replace(/px|%/, ''));
                        return isNaN(numValue) || desktopWidthValue <= 0 ? 1 : numValue / desktopWidthValue;
                      })();
                      return ((scale - 0.5) / (2 - 0.5)) * 100;
                    })()}%, #e5e7eb 100%)`
                  }}
                />
                {isEditingZoom ? (
                  <input
                    type="number"
                    autoFocus
                    defaultValue={(() => {
                      if (quizWidth === '100%' || quizWidth === 'auto') return 100;
                      const numValue = parseInt((quizWidth || `${desktopWidthValue}px`).replace(/px|%/, ''));
                      const scale = isNaN(numValue) || desktopWidthValue <= 0 ? 1 : numValue / desktopWidthValue;
                      return Math.round(scale * 100);
                    })()}
                    min={50}
                    max={200}
                    className="w-[90px] bg-white border border-[#44444d] px-2 py-1 rounded text-sm text-gray-900 text-center outline-none"
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) {
                        const clampedPct = Math.max(50, Math.min(200, Math.round(val)));
                        const width = Math.round((clampedPct / 100) * desktopWidthValue);
                        onQuizWidthChange?.(`${width}px`);
                      }
                      setIsEditingZoom(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      if (e.key === 'Escape') { setIsEditingZoom(false); }
                    }}
                  />
                ) : (
                  <div
                    className="bg-gray-100 border border-gray-300 px-3 py-1 rounded text-sm text-gray-900 min-w-[80px] text-center cursor-text"
                    title="Cliquez ou double-cliquez pour saisir un pourcentage"
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsEditingZoom(true)}
                    onDoubleClick={() => setIsEditingZoom(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditingZoom(true); }}
                  >
                    {(() => {
                      if (quizWidth === '100%' || quizWidth === 'auto') return '100%';
                      const numValue = parseInt(quizWidth.replace(/px|%/, ''));
                      const scale = isNaN(numValue) || desktopWidthValue <= 0 ? 1 : numValue / desktopWidthValue;
                      return `${Math.round(scale * 100)}%`;
                  })()}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>50%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          )}

          {/* Mobile Zoom Scale - Custom Slider */}
          {selectedDevice === 'mobile' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Zoom Mobile
              </label>
              {/* Debug info removed */}
              <div className="flex items-center space-x-3">
                {/* Custom Mobile Slider */}
                <div className="flex-1 relative">
                  <div 
                    className="h-2 bg-gray-200 rounded-lg cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const scale = 0.3 + (percentage * (1.5 - 0.3));
                      const clampedScale = Math.max(0.3, Math.min(1.5, scale));
                      const width = Math.round(clampedScale * mobileWidthValue);
                      console.log('🔧 Mobile custom slider click:', { percentage, scale: clampedScale, width });
                      onQuizMobileWidthChange(`${width}px`);
                    }}
                  >
                    {/* Track fill */}
                    <div 
                      className="h-full rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, #44444d 0%, #a21d6b 100%)',
                        width: `${(() => {
                          console.log('🎨 Track fill calculation - quizMobileWidth:', quizMobileWidth);
                          if (quizMobileWidth === '100%' || quizMobileWidth === 'auto') return ((1 - 0.3) / (1.5 - 0.3)) * 100; // 1.0 scale midpoint
                          const numValue = parseInt(quizMobileWidth.replace(/px|%/, ''));
                          const scale = isNaN(numValue) || mobileWidthValue <= 0 ? 1 : numValue / mobileWidthValue;
                          const percentage = ((scale - 0.3) / (1.5 - 0.3)) * 100;
                          console.log('🎨 Track fill - numValue:', numValue, 'scale:', scale, 'percentage:', percentage);
                          return percentage;
                        })()}%`
                      }}
                    />
                    {/* Thumb */}
                    <div 
                      className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2"
                      style={{
                        background: '#44444d',
                        left: `${(() => {
                          console.log('🎯 Thumb position calculation - quizMobileWidth:', quizMobileWidth);
                          if (quizMobileWidth === '100%' || quizMobileWidth === 'auto') return ((1 - 0.3) / (1.5 - 0.3)) * 100; // 1.0 scale midpoint
                          const numValue = parseInt(quizMobileWidth.replace(/px|%/, ''));
                          const scale = isNaN(numValue) || mobileWidthValue <= 0 ? 1 : numValue / mobileWidthValue;
                          const percentage = ((scale - 0.3) / (1.5 - 0.3)) * 100;
                          console.log('🎯 Thumb position - numValue:', numValue, 'scale:', scale, 'percentage:', percentage);
                          return percentage;
                        })()}%`,
                        marginLeft: '-8px'
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const track = e.currentTarget.parentElement;
                        if (!track) return;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const rect = track.getBoundingClientRect();
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(1, x / rect.width));
                          const scale = 0.3 + (percentage * (1.5 - 0.3));
                          const width = Math.round(scale * mobileWidthValue);
                          console.log('🔧 Mobile custom slider drag:', { percentage, scale, width });
                          onQuizMobileWidthChange(`${width}px`);
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                </div>
                <div className="px-3 py-1 rounded text-sm text-white min-w-[80px] text-center" style={{ background: '#44444d' }}>
                  {(() => {
                    if (quizMobileWidth === '100%' || quizMobileWidth === 'auto') return '100%';
                    const numValue = parseInt(quizMobileWidth.replace(/px|%/, ''));
                    const scale = isNaN(numValue) || mobileWidthValue <= 0 ? 1 : numValue / mobileWidthValue;
                    return `${Math.round(scale * 100)}%`;
                  })()}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>30%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
              {/* Mobile zoom explanatory note removed */}
            </div>
          )}
        </div>

        {/* Device-specific note removed */}
      </div>
    </div>
  );
};

export default QuizConfigPanel;

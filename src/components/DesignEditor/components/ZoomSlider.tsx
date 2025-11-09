import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { isRealMobile } from '@/utils/isRealMobile';

interface ZoomSliderProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  defaultZoom?: number;
  onNavigateToScreen2?: () => void;
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
}

const ZoomSlider: React.FC<ZoomSliderProps> = React.memo(({ 
  zoom,
  onZoomChange,
  minZoom = 0.1,
  maxZoom = 1,
  step = 0.05,
  defaultZoom = 1,
  onNavigateToScreen2,
  currentScreen = 'screen1'
}) => {
  const isMobile = isRealMobile();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onZoomChange(value);
  };

  // Buttons removed; only slider change handler retained
  const [sidebarOffsetRem, setSidebarOffsetRem] = React.useState<number>(25);
  React.useEffect(() => {
    if (isMobile) return;
    // Detect HybridSidebar state via data attributes injected in HybridSidebar.tsx
    const compute = () => {
      const expanded = document.querySelector('[data-hybrid-sidebar="expanded"]');
      const collapsed = document.querySelector('[data-hybrid-sidebar="collapsed"]');
      if (expanded) return 25; // w-20 + w-80 = 25rem
      if (collapsed) return 5; // w-16 ~ 4rem but primary rail is w-20 => 5rem safe area
      return 5;
    };
    setSidebarOffsetRem(compute());
    const observer = new MutationObserver(() => {
      setSidebarOffsetRem(compute());
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: false });
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div className={`fixed bottom-6 z-50`} style={{ left: isMobile ? 16 : `calc(${sidebarOffsetRem}rem + 1rem)` }}>
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 h-10">
        {/* Zoom Slider only */}
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={step}
          value={zoom}
          onChange={handleSliderChange}
          className="w-40 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
          style={{
            // keep solid base; progress overlay handled in CSS with background-size
            backgroundImage: 'linear-gradient(#e5b5cf, #e5b5cf)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${((zoom - minZoom) / (maxZoom - minZoom)) * 100}% 100%`,
            backgroundColor: '#e5e7eb'
          }}
          aria-label="Zoom"
        />

        {/* Screen navigation button (restored) */}
        {onNavigateToScreen2 && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={onNavigateToScreen2}
              className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm h-8"
              aria-label={
                currentScreen === 'screen1' ? "Aller à l'écran 2" : 
                currentScreen === 'screen2' ? "Aller à l'écran 3" : 
                "Retour à l'écran 1"
              }
              title={
                currentScreen === 'screen1' ? "Aller à l'écran 2" : 
                currentScreen === 'screen2' ? "Aller à l'écran 3" : 
                "Retour à l'écran 1"
              }
            >
              <span className="text-xs font-medium text-gray-700">
                {currentScreen === 'screen1' ? 'Écran 2' : 
                 currentScreen === 'screen2' ? 'Écran 3' : 
                 'Écran 1'}
              </span>
              {currentScreen === 'screen1' || currentScreen === 'screen2' ? (
                <ChevronDown size={14} className="text-gray-600" />
              ) : (
                <ChevronUp size={14} className="text-gray-600" />
              )}
            </button>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Base input reset */
          .zoom-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 9999px;
            outline: none;
            background-color: #e5e7eb;
          }

          /* WebKit track */
          .zoom-slider::-webkit-slider-runnable-track {
            height: 4px;
            background: var(--track-bg, #e5e7eb);
            border-radius: 9999px;
          }

          .zoom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #44444d;
            cursor: pointer;
            border: 2px solid #ffffff;
            margin-top: -6px; /* center thumb on 4px track */
          }

          /* Firefox track */
          .zoom-slider::-moz-range-track {
            height: 4px;
            background: var(--track-bg, #e5e7eb);
            border-radius: 9999px;
          }

          .zoom-slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #44444d;
            cursor: pointer;
            border: 2px solid #ffffff;
          }

          .zoom-slider:focus { outline: none; box-shadow: none; }
        `
      }} />
    </div>
  );
});

ZoomSlider.displayName = 'ZoomSlider';

export default ZoomSlider;

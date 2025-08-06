import React, { useState, useCallback, useMemo } from 'react';
import type { DeviceType } from '../../../utils/deviceDimensions';

interface TouchDebugOverlayProps {
  selectedDevice: DeviceType;
  containerRef: React.RefObject<HTMLElement>;
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * Composant de debug pour visualiser et tester les optimisations tactiles
 * Version simplifiée pour éviter les boucles infinies
 */
export const TouchDebugOverlay: React.FC<TouchDebugOverlayProps> = ({
  selectedDevice,
  isVisible,
  onToggle
}) => {
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number; type: string } | null>(null);

  // Calcul statique des informations de debug (sans useEffect)
  const debugInfo = useMemo(() => {
    if (!isVisible) return null;
    
    const getCalibration = () => {
      switch (selectedDevice) {
        case 'mobile':
          return {
            offsetY: 45,
            offsetX: 0,
            precisionFactor: 0.98,
            sensitivity: 1.3,
            zoneMultiplier: 1.1
          };
        case 'tablet':
          return {
            offsetY: 35,
            offsetX: 0,
            precisionFactor: 0.99,
            sensitivity: 1.2,
            zoneMultiplier: 1.05
          };
        default:
          return {
            offsetY: 0,
            offsetX: 0,
            precisionFactor: 1,
            sensitivity: 1,
            zoneMultiplier: 1
          };
      }
    };

    return {
      device: selectedDevice,
      isTouchDevice: selectedDevice !== 'desktop',
      calibration: getCalibration(),
      zoomScale: 1 // Valeur par défaut
    };
  }, [selectedDevice, isVisible]);

  // Gestionnaire de mouvement simplifié
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isVisible || e.pointerType !== 'touch') return;
    
    setLastTouch({
      x: e.clientX,
      y: e.clientY,
      type: e.pointerType
    });
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Afficher le debug tactile"
      >
        🔧
      </button>
    );
  }

  return (
    <>
      {/* Bouton de fermeture */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Masquer le debug tactile"
      >
        ✕
      </button>

      {/* Overlay de debug */}
      <div 
        className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
        onPointerMove={handlePointerMove}
      >
        <h3 className="text-lg font-bold mb-3 text-yellow-400">🔧 Debug Tactile</h3>
        
        {/* Informations de l'appareil */}
        <div className="mb-4">
          <h4 className="font-semibold text-blue-300">📱 Appareil</h4>
          <div className="text-sm space-y-1">
            <div>Type: <span className="text-green-300">{debugInfo?.device}</span></div>
            <div>Tactile: <span className="text-green-300">{debugInfo?.isTouchDevice ? 'Oui' : 'Non'}</span></div>
            <div>Zoom: <span className="text-green-300">{debugInfo?.zoomScale?.toFixed(2)}x</span></div>
          </div>
        </div>

        {/* Calibrage tactile */}
        {debugInfo?.calibration && (
          <div className="mb-4">
            <h4 className="font-semibold text-blue-300">⚙️ Calibrage</h4>
            <div className="text-sm space-y-1">
              <div>Offset Y: <span className="text-yellow-300">{debugInfo.calibration.offsetY}px</span></div>
              <div>Précision: <span className="text-yellow-300">{debugInfo.calibration.precisionFactor}</span></div>
              <div>Sensibilité: <span className="text-yellow-300">{debugInfo.calibration.sensitivity}</span></div>
              <div>Zone: <span className="text-yellow-300">{debugInfo.calibration.zoneMultiplier}x</span></div>
            </div>
          </div>
        )}

        {/* Dernière interaction tactile */}
        {lastTouch && (
          <div className="mb-4">
            <h4 className="font-semibold text-blue-300">👆 Dernière Interaction</h4>
            <div className="text-sm space-y-1">
              <div>Type: <span className="text-purple-300">{lastTouch.type}</span></div>
              <div>X: <span className="text-purple-300">{lastTouch.x.toFixed(1)}px</span></div>
              <div>Y: <span className="text-purple-300">{lastTouch.y.toFixed(1)}px</span></div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-300 border-t border-gray-600 pt-2">
          <div>• Touchez l'écran pour voir les coordonnées</div>
          <div>• Testez le drag & drop des éléments</div>
          <div>• Vérifiez la précision du positionnement</div>
        </div>
      </div>

      {/* Indicateur visuel de la zone tactile */}
      {lastTouch && debugInfo?.isTouchDevice && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: lastTouch.x - 25,
            top: lastTouch.y - debugInfo.calibration.offsetY - 25,
            width: 50,
            height: 50,
            border: '2px solid #ff6b6b',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 107, 107, 0.2)',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
        </div>
      )}
    </>
  );
};

export default TouchDebugOverlay;

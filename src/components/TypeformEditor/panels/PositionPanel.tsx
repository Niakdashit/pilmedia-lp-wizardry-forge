import React, { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, Lock, RotateCw } from 'lucide-react';

interface PositionPanelProps {
  onBack: () => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

const PositionPanel: React.FC<PositionPanelProps> = ({
  onBack,
  selectedElement,
  onElementUpdate,
  // canvasRef removed as unused
}) => {
  const [activeTab, setActiveTab] = useState<'organiser' | 'calques'>('organiser');
  const [isRatioLocked, setIsRatioLocked] = useState(true);

  // Normalize angle to [-180, 180]
  const normalize180 = useCallback((deg: number) => {
    return ((deg + 180) % 360 + 360) % 360 - 180;
  }, []);

  // Obtenir les dimensions RÉELLES du canvas de travail
  const getCanvasDimensions = () => {
    // Dimensions réelles du canvas de design (zone de travail verte)
    const REAL_CANVAS_WIDTH = 800;  // Largeur réelle de la zone de design
    const REAL_CANVAS_HEIGHT = 600; // Hauteur réelle de la zone de design
    
    console.log('🎯 Using REAL canvas dimensions:', { 
      width: REAL_CANVAS_WIDTH, 
      height: REAL_CANVAS_HEIGHT,
      note: 'These are the actual design area dimensions'
    });
    
    return { 
      width: REAL_CANVAS_WIDTH, 
      height: REAL_CANVAS_HEIGHT 
    };
  };

  // Obtenir les dimensions réelles de l'élément sélectionné
  const getElementDimensions = () => {
    if (!selectedElement) {
      return { width: 200, height: 40 }; // Fallback
    }
    return {
      width: selectedElement.width || 200,
      height: selectedElement.height || 40
    };
  };

  // Fonctions d'organisation (avant/arrière)
  const moveToFront = () => {
    if (onElementUpdate) {
      onElementUpdate({ zIndex: (selectedElement?.zIndex || 0) + 1 });
    }
  };

  const moveToBack = () => {
    if (onElementUpdate) {
      onElementUpdate({ zIndex: Math.max(0, (selectedElement?.zIndex || 0) - 1) });
    }
  };

  const moveForward = () => {
    if (onElementUpdate) {
      onElementUpdate({ zIndex: (selectedElement?.zIndex || 0) + 1 });
    }
  };

  const moveBackward = () => {
    if (onElementUpdate) {
      onElementUpdate({ zIndex: Math.max(0, (selectedElement?.zIndex || 0) - 1) });
    }
  };

  // ALIGNEMENTS EXTRÊMS - GARANTIS AUX BORDS EXACTS
  
  const alignToTop = () => {
    if (onElementUpdate && selectedElement) {
      console.log('🔺 ALIGN TO TOP - Positioning at y = 0');
      onElementUpdate({ y: 0 });
    }
  };

  const alignToBottom = () => {
    if (onElementUpdate && selectedElement) {
      const { height: canvasHeight } = getCanvasDimensions();
      const { height: elementHeight } = getElementDimensions();
      const newY = canvasHeight - elementHeight;
      
      console.log('🔻 ALIGN TO BOTTOM - EXACT POSITIONING:', { 
        canvasHeight, 
        elementHeight, 
        calculatedY: newY,
        formula: `${canvasHeight} - ${elementHeight} = ${newY}`
      });
      
      onElementUpdate({ y: newY });
    }
  };

  const alignToLeft = () => {
    if (onElementUpdate && selectedElement) {
      onElementUpdate({ x: 0 });
    }
  };

  const alignToRight = () => {
    if (onElementUpdate && selectedElement) {
      const { width: canvasWidth } = getCanvasDimensions();
      const { width: elementWidth } = getElementDimensions();
      const newX = canvasWidth - elementWidth;
      
        canvasWidth, 
        elementWidth, 
        calculatedX: newX,
        formula: `${canvasWidth} - ${elementWidth} = ${newX}`,
        elementInfo: {
          id: selectedElement.id,
          currentX: selectedElement.x,
          currentWidth: selectedElement.width
        }
      });
      
      onElementUpdate({ x: newX });
      
      // Vérification immédiate
      setTimeout(() => {
      }, 50);
    }
  };

  const alignToCenter = () => {
    if (onElementUpdate && selectedElement) {
      const { width: canvasWidth } = getCanvasDimensions();
      const { width: elementWidth } = getElementDimensions();
      const newX = (canvasWidth - elementWidth) / 2;
      
      console.log('🎯 ALIGN TO CENTER - EXACT CENTERING:', { 
        canvasWidth, 
        elementWidth, 
        calculatedX: newX,
        formula: `(${canvasWidth} - ${elementWidth}) / 2 = ${newX}`
      });
      
      onElementUpdate({ x: newX });
    }
  };

  const alignToMiddle = () => {
    if (onElementUpdate && selectedElement) {
      const { height: canvasHeight } = getCanvasDimensions();
      const { height: elementHeight } = getElementDimensions();
      const newY = (canvasHeight - elementHeight) / 2;
      
      console.log('🎯 ALIGN TO MIDDLE - EXACT CENTERING:', { 
        canvasHeight, 
        elementHeight, 
        calculatedY: newY,
        formula: `(${canvasHeight} - ${elementHeight}) / 2 = ${newY}`
      });
      
      onElementUpdate({ y: newY });
    }
  };

  // Mise à jour des dimensions avec ratio verrouillé
  const updateDimensions = (field: 'width' | 'height', value: number) => {
    if (!onElementUpdate) return;
    
    if (isRatioLocked && selectedElement?.width && selectedElement?.height) {
      const ratio = selectedElement.width / selectedElement.height;
      if (field === 'width') {
        onElementUpdate({ 
          width: value, 
          height: Math.round(value / ratio) 
        });
      } else {
        onElementUpdate({ 
          width: Math.round(value * ratio), 
          height: value 
        });
      }
    } else {
      onElementUpdate({ [field]: value });
    }
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowUp className="w-4 h-4 rotate-180" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Position</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('organiser')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'organiser'
              ? 'text-[#44444d] border-b-2 border-[#44444d] bg-purple-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Organiser
        </button>
        <button
          onClick={() => setActiveTab('calques')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'calques'
              ? 'text-[#44444d] border-b-2 border-[#44444d] bg-purple-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calques
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {activeTab === 'organiser' && (
          <>
            {/* Organisation */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Organisation</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={moveToFront}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Premier plan</span>
                </button>
                <button
                  onClick={moveToBack}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm font-medium">Arrière-plan</span>
                </button>
                <button
                  onClick={moveForward}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Avancer</span>
                </button>
                <button
                  onClick={moveBackward}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm font-medium">Reculer</span>
                </button>
              </div>
            </div>

            {/* Alignement sur la page */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Aligner sur la page</h4>
              
              {/* Ligne 1: Haut et Gauche */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={alignToTop}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Haut - ligne en haut */}
                  <div className="w-4 h-4 flex items-start justify-center">
                    <div className="w-3 h-0.5 bg-current"></div>
                  </div>
                  <span className="text-sm font-medium">Haut</span>
                </button>
                <button
                  onClick={alignToLeft}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Gauche - ligne à gauche */}
                  <div className="w-4 h-4 flex items-center justify-start">
                    <div className="w-0.5 h-3 bg-current"></div>
                  </div>
                  <span className="text-sm font-medium">Gauche</span>
                </button>
              </div>
              
              {/* Ligne 2: Centre et Centre */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={alignToCenter}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Centre horizontal - lignes verticales */}
                  <div className="w-4 h-4 flex items-center justify-center space-x-0.5">
                    <div className="w-0.5 h-3 bg-current opacity-50"></div>
                    <div className="w-0.5 h-4 bg-current"></div>
                    <div className="w-0.5 h-3 bg-current opacity-50"></div>
                  </div>
                  <span className="text-sm font-medium">Centre</span>
                </button>
                <button
                  onClick={alignToMiddle}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Centre vertical - lignes horizontales */}
                  <div className="w-4 h-4 flex flex-col items-center justify-center space-y-0.5">
                    <div className="w-3 h-0.5 bg-current opacity-50"></div>
                    <div className="w-4 h-0.5 bg-current"></div>
                    <div className="w-3 h-0.5 bg-current opacity-50"></div>
                  </div>
                  <span className="text-sm font-medium">Centre</span>
                </button>
              </div>
              
              {/* Ligne 3: Bas et Droite */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={alignToBottom}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Bas - ligne en bas */}
                  <div className="w-4 h-4 flex items-end justify-center">
                    <div className="w-3 h-0.5 bg-current"></div>
                  </div>
                  <span className="text-sm font-medium">Bas</span>
                </button>
                <button
                  onClick={alignToRight}
                  className="flex items-center justify-center space-x-2 p-3 border border-gray-200 hover:border-[#44444d] hover:bg-[#44444d] hover:text-white rounded-lg transition-all duration-200"
                >
                  {/* Icône Droite - ligne à droite */}
                  <div className="w-4 h-4 flex items-center justify-end">
                    <div className="w-0.5 h-3 bg-current"></div>
                  </div>
                  <span className="text-sm font-medium">Droite</span>
                </button>
              </div>
            </div>

            {/* Avancé */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Avancé</h4>
              
              {/* Dimensions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dimensions</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Largeur</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement?.width || 200)}
                      onChange={(e) => updateDimensions('width', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hauteur</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement?.height || 40)}
                      onChange={(e) => updateDimensions('height', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setIsRatioLocked(!isRatioLocked)}
                      className={`p-2 rounded transition-colors ${
                        isRatioLocked 
                          ? 'bg-[#44444d] text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement?.x || 0)}
                      onChange={(e) => onElementUpdate && onElementUpdate({ x: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#44444d] focus:ring-1 focus:ring-[#44444d] transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y (px)</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement?.y || 0)}
                      onChange={(e) => onElementUpdate && onElementUpdate({ y: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#44444d] focus:ring-1 focus:ring-[#44444d] transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <RotateCw className="w-4 h-4" />
                  <span>Rotation</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={Math.round(normalize180(selectedElement?.rotation || 0))}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const next = Number.isFinite(val) ? normalize180(val) : 0;
                      onElementUpdate && onElementUpdate({ rotation: next });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#44444d] focus:ring-1 focus:ring-[#44444d] transition-colors"
                    placeholder="0"
                    min="-180"
                    max="180"
                  />
                  <span className="text-xs text-gray-500 font-medium">°</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'calques' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Gestion des calques</h4>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Cette section permettra de gérer l'ordre et la visibilité des différents éléments du canvas.
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Fonctionnalité à venir
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PositionPanel;

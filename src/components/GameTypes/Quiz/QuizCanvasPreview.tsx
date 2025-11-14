import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuizCanvasPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

/**
 * QuizCanvasPreview - Affiche les 3 écrans du canvas en mode preview
 * C'est du mirroring pur : on affiche exactement ce qui est dans l'éditeur
 */
const QuizCanvasPreview: React.FC<QuizCanvasPreviewProps> = ({
  campaign,
  previewDevice,
  className = ''
}) => {
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');

  // 🔍 DEBUG: Log pour vérifier que le composant est bien appelé
  console.log('🎯 [QuizCanvasPreview] Rendering with campaign:', {
    hasCampaign: !!campaign,
    campaignId: campaign?.id,
    campaignType: campaign?.type,
    hasConfig: !!campaign?.config,
    hasCanvasConfig: !!campaign?.config?.canvasConfig,
    hasElements: !!campaign?.config?.canvasConfig?.elements,
    elementsCount: campaign?.config?.canvasConfig?.elements?.length || 0
  });

  // Récupérer les éléments du canvas par écran
  const canvasElements = useMemo(() => {
    const elements = campaign?.config?.canvasConfig?.elements || 
                     campaign?.config?.elements || 
                     campaign?.canvasConfig?.elements || 
                     [];
    
    console.log('🧩 [QuizCanvasPreview] Canvas elements:', {
      totalElements: elements.length,
      screen1Count: elements.filter((el: any) => el.screenId === 'screen1').length,
      screen2Count: elements.filter((el: any) => el.screenId === 'screen2').length,
      screen3Count: elements.filter((el: any) => el.screenId === 'screen3').length
    });
    
    return {
      screen1: elements.filter((el: any) => el.screenId === 'screen1'),
      screen2: elements.filter((el: any) => el.screenId === 'screen2'),
      screen3: elements.filter((el: any) => el.screenId === 'screen3')
    };
  }, [campaign]);

  // Récupérer les backgrounds par écran
  const screenBackgrounds = useMemo(() => {
    const backgrounds = campaign?.config?.canvasConfig?.screenBackgrounds || 
                       campaign?.screenBackgrounds || 
                       {};
    
    return {
      screen1: backgrounds.screen1 || { type: 'color', value: '#f3f4f6' },
      screen2: backgrounds.screen2 || { type: 'color', value: '#f3f4f6' },
      screen3: backgrounds.screen3 || { type: 'color', value: '#f3f4f6' }
    };
  }, [campaign]);

  // Récupérer les modules modulaires par écran
  const modularModules = useMemo(() => {
    const modularPage = campaign?.design?.quizModules || 
                       campaign?.config?.modularPage || 
                       campaign?.modularPage || 
                       { screens: {} };
    
    return {
      screen1: modularPage.screens?.screen1 || [],
      screen2: modularPage.screens?.screen2 || [],
      screen3: modularPage.screens?.screen3 || []
    };
  }, [campaign]);

  const currentElements = canvasElements[currentScreen];
  const currentBackground = screenBackgrounds[currentScreen];
  const currentModules = modularModules[currentScreen];

  // Style du background
  const backgroundStyle = useMemo(() => {
    if (currentBackground.type === 'image' && currentBackground.value) {
      return {
        backgroundImage: `url(${currentBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      backgroundColor: currentBackground.value || '#f3f4f6'
    };
  }, [currentBackground]);

  // Navigation entre les écrans
  const goToPrevScreen = () => {
    if (currentScreen === 'screen2') setCurrentScreen('screen1');
    else if (currentScreen === 'screen3') setCurrentScreen('screen2');
  };

  const goToNextScreen = () => {
    if (currentScreen === 'screen1') setCurrentScreen('screen2');
    else if (currentScreen === 'screen2') setCurrentScreen('screen3');
  };

  const canGoPrev = currentScreen !== 'screen1';
  const canGoNext = currentScreen !== 'screen3';

  // Rendu d'un élément canvas
  const renderCanvasElement = (element: any) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x || 0}px`,
      top: `${element.y || 0}px`,
      width: element.width ? `${element.width}px` : 'auto',
      height: element.height ? `${element.height}px` : 'auto',
      zIndex: element.zIndex || 1,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      opacity: element.opacity !== undefined ? element.opacity : 1
    };

    if (element.type === 'text') {
      return (
        <div
          key={element.id}
          style={{
            ...style,
            color: element.color || '#000000',
            fontSize: `${element.fontSize || 16}px`,
            fontFamily: element.fontFamily || 'Inter, sans-serif',
            fontWeight: element.fontWeight || 400,
            fontStyle: element.fontStyle || 'normal',
            textDecoration: element.textDecoration || 'none',
            textAlign: (element.textAlign || 'left') as any,
            lineHeight: element.lineHeight || 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {element.content || element.text || ''}
        </div>
      );
    }

    if (element.type === 'image' && element.src) {
      return (
        <img
          key={element.id}
          src={element.src}
          alt={element.alt || ''}
          style={{
            ...style,
            objectFit: (element.objectFit || 'cover') as any,
            borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined
          }}
        />
      );
    }

    if (element.type === 'shape') {
      return (
        <div
          key={element.id}
          style={{
            ...style,
            backgroundColor: element.backgroundColor || element.fill || '#000000',
            borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#000000'}` : undefined
          }}
        />
      );
    }

    return null;
  };

  // Rendu d'un module modulaire
  const renderModularModule = (module: any, index: number) => {
    if (!module) return null;

    const moduleStyle: React.CSSProperties = {
      marginBottom: '16px',
      ...module.style
    };

    if (module.type === 'BlocTexte') {
      return (
        <div
          key={`module-${index}`}
          style={{
            ...moduleStyle,
            color: module.textColor || '#000000',
            fontSize: `${module.fontSize || 16}px`,
            fontFamily: module.fontFamily || 'Inter, sans-serif',
            fontWeight: module.fontWeight || 400,
            textAlign: (module.textAlign || 'left') as any,
            padding: module.padding || '0'
          }}
          dangerouslySetInnerHTML={{ __html: module.content || '' }}
        />
      );
    }

    if (module.type === 'BlocImage' && module.imageUrl) {
      return (
        <div key={`module-${index}`} style={moduleStyle}>
          <img
            src={module.imageUrl}
            alt={module.alt || ''}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: module.borderRadius ? `${module.borderRadius}px` : undefined
            }}
          />
        </div>
      );
    }

    if (module.type === 'BlocBouton') {
      return (
        <div key={`module-${index}`} style={moduleStyle}>
          <button
            style={{
              background: module.background || '#000000',
              color: module.textColor || '#ffffff',
              padding: module.padding || '12px 24px',
              borderRadius: module.borderRadius ? `${module.borderRadius}px` : '8px',
              border: 'none',
              fontSize: `${module.fontSize || 16}px`,
              fontWeight: module.fontWeight || 600,
              cursor: 'pointer',
              boxShadow: module.boxShadow || 'none'
            }}
          >
            {module.text || 'Bouton'}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 🔍 DEBUG: Indicateur visuel pour confirmer que QuizCanvasPreview est rendu */}
      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold z-50">
        🎯 QuizCanvasPreview Active
      </div>

      {/* Écran actuel avec animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 overflow-auto"
          style={backgroundStyle}
        >
          {/* Conteneur pour les éléments canvas (positionnement absolu) */}
          <div className="relative w-full h-full">
            {currentElements.map(renderCanvasElement)}
            
            {/* 🔍 DEBUG: Afficher le nombre d'éléments */}
            {currentElements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-8 text-center">
                  <p className="text-yellow-800 font-semibold mb-2">
                    ⚠️ Aucun élément canvas sur {currentScreen}
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Total éléments: {canvasElements.screen1.length + canvasElements.screen2.length + canvasElements.screen3.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Conteneur pour les modules modulaires (flux normal) */}
          {currentModules.length > 0 && (
            <div className="relative w-full max-w-4xl mx-auto p-8">
              {currentModules.map(renderModularModule)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation entre les écrans */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <button
          onClick={goToPrevScreen}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Écran précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('screen1')}
            className={`w-2 h-2 rounded-full transition-all ${
              currentScreen === 'screen1' ? 'bg-[#841b60] w-8' : 'bg-gray-300'
            }`}
            title="Écran 1"
          />
          <button
            onClick={() => setCurrentScreen('screen2')}
            className={`w-2 h-2 rounded-full transition-all ${
              currentScreen === 'screen2' ? 'bg-[#841b60] w-8' : 'bg-gray-300'
            }`}
            title="Écran 2"
          />
          <button
            onClick={() => setCurrentScreen('screen3')}
            className={`w-2 h-2 rounded-full transition-all ${
              currentScreen === 'screen3' ? 'bg-[#841b60] w-8' : 'bg-gray-300'
            }`}
            title="Écran 3"
          />
        </div>

        <button
          onClick={goToNextScreen}
          disabled={!canGoNext}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Écran suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicateur d'écran */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg text-sm font-medium">
        Écran {currentScreen === 'screen1' ? '1' : currentScreen === 'screen2' ? '2' : '3'} / 3
      </div>
    </div>
  );
};

export default QuizCanvasPreview;

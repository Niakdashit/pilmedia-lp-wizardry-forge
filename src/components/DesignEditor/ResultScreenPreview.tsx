import React, { useState, useEffect } from 'react';
import ContrastBackground from '../common/ContrastBackground';
import { useMessageStore } from '@/stores/messageStore';

interface ResultScreenPreviewProps {
  campaign: any;
  device?: 'desktop' | 'tablet' | 'mobile';
}

/**
 * Composant d'aperçu de l'écran de résultat (screen3) en mode édition
 * Affiche un placeholder visuel de la carte de résultat qui sera générée automatiquement
 * S'adapte en fonction de l'onglet sélectionné (Gagnant/Perdant)
 */
const ResultScreenPreview: React.FC<ResultScreenPreviewProps> = ({
  campaign,
  device = 'desktop'
}) => {
  // État pour suivre l'onglet actif (winner ou loser)
  const [activeTab, setActiveTab] = useState<'winner' | 'loser'>('loser');
  const isNeutralConfirmation = Boolean(
    (campaign?.resultMessages && (campaign.resultMessages as any).confirmation)
    || (campaign?.type === 'form')
    || (campaign?.resultMode === 'confirmation')
  );
  
  // État pour forcer le re-render quand les modules changent
  const [, setForceUpdate] = useState(0);
  
  // Écouter les changements d'onglet depuis MessagesPanel (sauf en mode neutre)
  useEffect(() => {
    if (isNeutralConfirmation) return;
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.activeTab) {
        setActiveTab(customEvent.detail.activeTab);
      }
    };
    
    // Écouter les mises à jour des modules pour rafraîchir les styles du bouton
    const handleModuleUpdate = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('resultMessageTabChange', handleTabChange);
    window.addEventListener('editor-modules-sync', handleModuleUpdate);
    window.addEventListener('editor-module-sync', handleModuleUpdate);
    
    return () => {
      window.removeEventListener('resultMessageTabChange', handleTabChange);
      window.removeEventListener('editor-modules-sync', handleModuleUpdate);
      window.removeEventListener('editor-module-sync', handleModuleUpdate);
    };
  }, [isNeutralConfirmation]);
  
  // Récupérer les messages depuis le store Zustand ou depuis campaign.scratchResultMessages
  const { messages } = useMessageStore();
  
  // Fallbacks historiques + confirmation neutre
  const winnerConfig = campaign?.scratchResultMessages?.winner || messages.winner;
  const loserConfig = campaign?.scratchResultMessages?.loser || messages.loser;
  const neutralConfig = (campaign?.resultMessages as any)?.confirmation || {
    title: 'Merci !',
    message: 'Votre participation a été enregistrée.',
    subMessage: 'Vous recevrez une confirmation par email.',
    buttonText: 'Fermer'
  };
  
  // Sélectionner la configuration
  const currentConfig = isNeutralConfirmation
    ? neutralConfig
    : (activeTab === 'winner' ? winnerConfig : loserConfig);

  const frameConfig = {
    color: 'rgba(255,255,255,0.9)',
    opacity: 90,
    padding: 24,
    borderRadius: 2
  };

  // Récupérer les styles du bouton "Participer" depuis les modules de l'écran 1
  const getButtonStyles = () => {
    // Chercher dans plusieurs emplacements possibles selon l'éditeur
    const screen1Modules = 
      campaign?.design?.designModules?.screens?.screen1 || // DesignEditor (legacy)
      campaign?.modularPage?.screens?.screen1 || // Top-level modularPage
      campaign?.config?.modularPage?.screens?.screen1 || // Fallback from DB config
      [];
    
    console.log('🔍 [ResultScreenPreview] Recherche du bouton:', {
      screen1ModulesCount: screen1Modules.length,
      modules: screen1Modules,
      hasDesignModules: !!campaign?.design?.designModules,
      hasModularPage: !!campaign?.modularPage,
      hasConfigModularPage: !!campaign?.config?.modularPage
    });
    
    // Trouver le premier BlocBouton
    const buttonModule = screen1Modules.find((m: any) => m.type === 'BlocBouton');
    
    console.log('🎨 [ResultScreenPreview] Bouton trouvé:', buttonModule);
    
    if (buttonModule) {
      const styles = {
        background: buttonModule.background || '#000000',
        color: buttonModule.textColor || '#ffffff',
        borderRadius: `${buttonModule.borderRadius ?? 9999}px`,
        border: `${buttonModule.borderWidth ?? 0}px solid ${buttonModule.borderColor || '#000000'}`,
        boxShadow: buttonModule.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
        textTransform: buttonModule.uppercase ? 'uppercase' : 'none',
        fontWeight: buttonModule.bold ? 'bold' : '600'
      };
      console.log('✅ [ResultScreenPreview] Styles appliqués:', styles);
      return styles;
    }
    
    // Fallback sur les couleurs de la campagne
    const fallbackStyles = {
      background: campaign?.design?.primaryColor || '#841b60',
      color: campaign?.design?.accentColor || '#ffffff',
      borderRadius: '9999px',
      border: '0px solid #000000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      textTransform: 'none',
      fontWeight: '600'
    };
    console.log('⚠️ [ResultScreenPreview] Fallback styles:', fallbackStyles);
    return fallbackStyles;
  };

  const buttonStyles = getButtonStyles();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      {/* Carte de résultat preview */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <ContrastBackground
          enabled={true}
          config={frameConfig}
          className="text-center space-y-4 w-full max-w-lg rounded-[2px] border border-black/5"
        >
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentConfig.title}
            </h2>
            <p className="text-lg text-gray-600">
              {currentConfig.message}
            </p>
            {currentConfig.subMessage && (
              <p className="text-sm text-gray-500">
                {currentConfig.subMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center space-y-3 pt-4 w-full">
            <button
              className="inline-flex items-center justify-center px-6 py-3 text-sm transition-transform hover:-translate-y-[1px] cursor-default font-semibold"
              style={{
                background: buttonStyles.background,
                color: buttonStyles.color,
                borderRadius: buttonStyles.borderRadius,
                border: buttonStyles.border,
                boxShadow: buttonStyles.boxShadow,
                textTransform: buttonStyles.textTransform as any,
                fontWeight: buttonStyles.fontWeight,
                width: 'min(280px, 100%)',
                maxWidth: '280px'
              }}
            >
              {currentConfig.buttonText}
            </button>
          </div>
        </ContrastBackground>
      </div>
    </div>
  );
};

export default ResultScreenPreview;

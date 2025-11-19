import { useState, useCallback, useEffect } from 'react';
import { WheelConfigService } from '../services/WheelConfigService';
import { useEditorStore } from '../stores/editorStore';

interface UseWheelConfigSyncProps {
  campaign: any;
  extractedColors: string[];
  onCampaignChange?: (campaign: any) => void;
}

/**
 * Hook pour synchroniser les configurations de roue en temps réel
 * Maintient la cohérence entre tous les composants
 */
export const useWheelConfigSync = ({
  campaign,
  extractedColors,
  onCampaignChange
}: UseWheelConfigSyncProps) => {
  const [wheelModalConfig, setWheelModalConfig] = useState<any>({});
  
  // Read from global store to catch updates from WheelConfigSettings
  // IMPORTANT: Select the entire campaign object to trigger on any nested changes
  const storeCampaign = useEditorStore((s) => s.campaign as any);
  
  // Also explicitly select _lastUpdate to ensure reactivity
  const storeLastUpdate = useEditorStore((s) => (s.campaign as any)?._lastUpdate);

  // Handler unifié pour les mises à jour
  const updateWheelConfig = useCallback(
    WheelConfigService.createConfigUpdateHandler(
      onCampaignChange || (() => {}),
      setWheelModalConfig
    ),
    [onCampaignChange]
  );

  // Synchroniser avec les changements de campagne (priorité au store global)
  useEffect(() => {
    // Prefer store campaign over props campaign for wheel config
    const activeCampaign = storeCampaign || campaign;
    
    if (activeCampaign?.design?.wheelConfig) {
      const designWheelConfig: any = activeCampaign.design.wheelConfig || {};
      const newConfig = {
        wheelBorderStyle: activeCampaign.design.wheelBorderStyle || designWheelConfig.borderStyle,
        wheelBorderColor: designWheelConfig.borderColor,
        wheelBorderWidth: designWheelConfig.borderWidth,
        wheelScale: designWheelConfig.scale !== undefined ? designWheelConfig.scale : 2.4,
        // ✅ On synchronise aussi la position pour que les boutons (Gauche/Centre/Centre haut/Droite)
        // soient toujours alignés avec la campagne chargée
        wheelPosition: designWheelConfig.position as 'left' | 'right' | 'center' | 'centerTop' | undefined,
      };
      
      console.log('🔄 [useWheelConfigSync] Syncing wheel config:', {
        source: storeCampaign ? 'store' : 'props',
        newConfig,
        _lastUpdate: activeCampaign._lastUpdate,
        storeLastUpdate
      });
      
      // Only update if values actually changed to avoid overwriting user input
      setWheelModalConfig((prev: any) => {
        const hasChanges = 
          prev.wheelBorderStyle !== newConfig.wheelBorderStyle ||
          prev.wheelBorderColor !== newConfig.wheelBorderColor ||
          prev.wheelBorderWidth !== newConfig.wheelBorderWidth ||
          prev.wheelScale !== newConfig.wheelScale ||
          prev.wheelPosition !== newConfig.wheelPosition;
        
        if (hasChanges) {
          console.log('🔄 [useWheelConfigSync] Config changed, updating:', { prev, newConfig });
          return newConfig;
        }
        
        return prev;
      });
    }
  }, [
    storeCampaign,
    storeLastUpdate, // Explicitly track _lastUpdate changes
    campaign?.design?.wheelConfig, 
    campaign?.design?.wheelBorderStyle
  ]);

  // Configuration canonique mise à jour
  const getCanonicalConfig = useCallback((options: { device?: string; shouldCropWheel?: boolean } = {}) => 
    WheelConfigService.getCanonicalWheelConfig(
      campaign,
      extractedColors,
      wheelModalConfig,
      options
    ),
    [campaign, extractedColors, wheelModalConfig]
  );

  return {
    wheelModalConfig,
    updateWheelConfig,
    getCanonicalConfig,
    // Handlers individuels pour compatibilité
    setWheelBorderStyle: (style: string) => updateWheelConfig({ borderStyle: style }),
    setWheelBorderColor: (color: string) => updateWheelConfig({ borderColor: color }),
    setWheelBorderWidth: (width: number) => updateWheelConfig({ borderWidth: width }),
    setWheelScale: (scale: number) => updateWheelConfig({ scale }),
    setShowBulbs: (show: boolean) => updateWheelConfig({ showBulbs: show }),
    setWheelPosition: (position: 'left' | 'right' | 'center' | 'centerTop') => updateWheelConfig({ position }),

  };
};
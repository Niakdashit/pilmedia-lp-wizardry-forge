import { useState, useCallback, useEffect } from 'react';
import { WheelConfigService } from '../services/WheelConfigService';

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

  // Handler unifié pour les mises à jour
  const updateWheelConfig = useCallback(
    WheelConfigService.createConfigUpdateHandler(
      onCampaignChange || (() => {}),
      setWheelModalConfig
    ),
    [onCampaignChange]
  );

  // Synchroniser avec les changements de campagne
  useEffect(() => {
    if (campaign?.design?.wheelConfig) {
      setWheelModalConfig({
        wheelBorderStyle: campaign.design.wheelBorderStyle,
        wheelBorderColor: campaign.design.wheelConfig.borderColor,
        wheelScale: campaign.design.wheelConfig.scale
      });
    }
  }, [campaign?.design?.wheelConfig, campaign?.design?.wheelBorderStyle]);

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
    setWheelScale: (scale: number) => updateWheelConfig({ scale })
  };
};
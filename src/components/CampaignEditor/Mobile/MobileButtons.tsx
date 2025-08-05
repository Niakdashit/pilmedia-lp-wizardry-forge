
import React from 'react';
import { MousePointer } from 'lucide-react';
import ButtonPlacement from './MobileButtons/ButtonPlacement';
import ButtonAction from './MobileButtons/ButtonAction';
import ButtonStyle from './MobileButtons/ButtonStyle';
import type { OptimizedCampaign } from '../../ModernEditor/types/CampaignTypes';

interface MobileButtonsProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const MobileButtons: React.FC<MobileButtonsProps> = ({ campaign, setCampaign }) => {
  const mobileConfig = campaign.mobileConfig || {};

  const updateMobileConfig = (key: string, value: unknown) => {
    setCampaign((prev) => ({
      ...prev,
      mobileConfig: { ...prev.mobileConfig, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <MousePointer className="w-5 h-5 text-[#841b60]" />
        <h3 className="text-lg font-medium text-gray-900">Buttons & Actions</h3>
      </div>

      <ButtonPlacement
        placement={mobileConfig.buttonPlacement || 'bottom'}
        onPlacementChange={(placement) => updateMobileConfig('buttonPlacement', placement)}
      />

      {/* Button Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Texte du bouton mobile
        </label>
        <input
          type="text"
          value={mobileConfig.buttonText || campaign.gameConfig?.[campaign.type]?.buttonLabel || 'Jouer'}
          onChange={(e) => updateMobileConfig('buttonText', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#841b60]"
          placeholder="Texte spécifique au mobile"
        />
      </div>

      <ButtonAction
        actionType={mobileConfig.buttonActionType || 'submit'}
        actionLink={mobileConfig.buttonLink || ''}
        onActionTypeChange={(type) => updateMobileConfig('buttonActionType', type)}
        onActionLinkChange={(link) => updateMobileConfig('buttonLink', link)}
      />

      <ButtonStyle
        buttonColor={mobileConfig.buttonColor || '#841b60'}
        buttonTextColor={mobileConfig.buttonTextColor || '#ffffff'}
        buttonShape={mobileConfig.buttonShape || 'rounded-lg'}
        buttonSize={mobileConfig.buttonSize || 'medium'}
        buttonShadow={typeof mobileConfig.buttonShadow === 'string' ? mobileConfig.buttonShadow : 'shadow-md'}
        onButtonColorChange={(color) => updateMobileConfig('buttonColor', color)}
        onButtonTextColorChange={(color) => updateMobileConfig('buttonTextColor', color)}
        onButtonShapeChange={(shape) => updateMobileConfig('buttonShape', shape)}
        onButtonSizeChange={(size) => updateMobileConfig('buttonSize', size)}
        onButtonShadowChange={(shadow) => updateMobileConfig('buttonShadow', shadow)}
      />

      {/* Button Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Espacement du bouton
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Marge externe</label>
            <input
              type="range"
              min="0"
              max="40"
              value={mobileConfig.buttonMargin || 16}
              onChange={(e) => updateMobileConfig('buttonMargin', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.buttonMargin || 16}px</div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Largeur (%)</label>
            <input
              type="range"
              min="40"
              max="100"
              value={mobileConfig.buttonWidth || 80}
              onChange={(e) => updateMobileConfig('buttonWidth', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">{mobileConfig.buttonWidth || 80}%</div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="button-hover"
            checked={typeof mobileConfig.buttonHoverEffect === 'boolean' ? mobileConfig.buttonHoverEffect : true}
            onChange={(e) => updateMobileConfig('buttonHoverEffect', e.target.checked)}
            className="w-4 h-4 text-[#841b60] border-gray-300 rounded focus:ring-[#841b60]"
          />
          <label htmlFor="button-hover" className="text-sm font-medium">
            Effet au survol/touch
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1 pl-7">
          Active les effets visuels lors de l'interaction avec le bouton.
        </p>
      </div>
    </div>
  );
};

export default MobileButtons;

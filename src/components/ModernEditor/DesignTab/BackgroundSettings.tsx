
import React from 'react';
import ImageUpload from '../../common/ImageUpload';
import { useEditorStore } from '../../../stores/editorStore';

interface BackgroundSettingsProps {
  design: any;
  setCampaign: (campaign: any) => void;
  campaign: any;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  design,
  setCampaign,
  campaign
}) => {
  const updateDesign = useEditorStore(state => state.updateDesign);

  const handleBackgroundImageChange = (imageUrl: string, device: 'desktop' | 'mobile') => {
    const updates = device === 'mobile' 
      ? { mobileBackgroundImage: imageUrl }
      : { backgroundImage: imageUrl };
    
    // Mise à jour du state local
    setCampaign({
      ...campaign,
      design: {
        ...design,
        ...updates
      },
      _lastUpdate: Date.now()
    });

    // Mise à jour du store global pour le preview
    updateDesign(updates);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Arrière-plan</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de fond
        </label>
        <input
          type="color"
          value={design.background || '#f8fafc'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, background: e.target.value },
              _lastUpdate: Date.now()
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <ImageUpload
          value={design.backgroundImage || ''}
          onChange={(url) => handleBackgroundImageChange(url, 'desktop')}
          label="Image de fond Desktop/Tablette"
        />
      </div>

      <div>
        <ImageUpload
          value={design.mobileBackgroundImage || ''}
          onChange={(url) => handleBackgroundImageChange(url, 'mobile')}
          label="Image de fond Mobile"
        />
      </div>
    </div>
  );
};

export default BackgroundSettings;

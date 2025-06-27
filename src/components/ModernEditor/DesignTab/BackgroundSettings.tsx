
import React from 'react';
import ImageUpload from '../../common/ImageUpload';

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
  const handleBackgroundImageChange = (imageUrl: string) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        backgroundImage: imageUrl
      }
    });
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
              design: { ...design, background: e.target.value }
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <ImageUpload
          value={design.backgroundImage || ''}
          onChange={handleBackgroundImageChange}
          label="Image de fond (Desktop/Tablette)"
        />
      </div>
    </div>
  );
};

export default BackgroundSettings;

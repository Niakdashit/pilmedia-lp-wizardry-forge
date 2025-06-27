
import React from 'react';
import { Image, Trash2 } from 'lucide-react';
import ImageUpload from '../../common/ImageUpload';

interface CustomImagesManagerProps {
  customImages: any[];
  setCampaign: (campaign: any) => void;
  campaign: any;
}

const CustomImagesManager: React.FC<CustomImagesManagerProps> = ({
  customImages,
  setCampaign,
  campaign
}) => {
  const design = campaign.design || {};

  const getInitialPosition = () => {
    const basePosition = { x: 100, y: 100 };
    const offset = customImages.length * 20;
    return {
      x: basePosition.x + offset,
      y: basePosition.y + offset
    };
  };

  const addCustomImage = () => {
    const position = getInitialPosition();
    const newImage = {
      id: Date.now(),
      src: '',
      x: position.x,
      y: position.y,
      width: 100,
      height: 100,
      rotation: 0
    };
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: [...customImages, newImage]
      }
    });
  };

  const removeCustomImage = (id: number) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: customImages.filter((img: any) => img.id !== id)
      }
    });
  };

  const handleCustomImageChange = (id: number, field: string, value: any) => {
    setCampaign({
      ...campaign,
      design: {
        ...design,
        customImages: customImages.map((img: any) => img.id === id ? {
          ...img,
          [field]: value
        } : img)
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Images personnalisées</h3>
        <button
          onClick={addCustomImage}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Image className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {customImages.length === 0 && (
        <p className="text-gray-500 text-sm">Aucune image personnalisée. Cliquez sur "Ajouter" pour en créer une.</p>
      )}

      {customImages.map((customImage: any, index: number) => (
        <div key={customImage.id} className="space-y-4 bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Image #{index + 1}
            </label>
            
            <button
              onClick={() => removeCustomImage(customImage.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer cette image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <ImageUpload
              value={customImage.src || ''}
              onChange={(imageUrl) =>
                handleCustomImageChange(customImage.id, 'src', imageUrl)
              }
              label="Image"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomImagesManager;

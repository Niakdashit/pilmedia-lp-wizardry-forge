import React from 'react';
import { Upload, Palette } from 'lucide-react';

interface QualifioGeneralTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioGeneralTab: React.FC<QualifioGeneralTabProps> = ({
  campaign,
  setCampaign
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCampaign({
          ...campaign,
          banner: {
            ...campaign.banner,
            image: e.target?.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSettings = (key: string, value: any) => {
    setCampaign({
      ...campaign,
      settings: {
        ...campaign.settings,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Dimensions</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">↔</span>
            <label className="text-sm text-gray-600 w-20">Largeur</label>
            <input
              type="number"
              value={campaign.settings?.width || 810}
              onChange={(e) => updateSettings('width', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-orange-500">↕</span>
            <label className="text-sm text-gray-600 w-20">Hauteur</label>
            <input
              type="number"
              value={campaign.settings?.height || 1200}
              onChange={(e) => updateSettings('height', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-orange-500">⚓</span>
            <label className="text-sm text-gray-600 w-20">Ancre</label>
            <select className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Fixe</option>
              <option>Flottant</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bannière</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-600 mb-2 block">Bannière (810 x free)</span>
            <div className="flex space-x-2">
              <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM2 14a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                </svg>
              </button>
              <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM4 5h12v8H4V5z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center relative">
            {campaign.banner?.image ? (
              <div className="relative">
                <img
                  src={campaign.banner.image}
                  alt="Bannière"
                  className="w-full h-32 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                  <div className="text-white text-center">
                    <div className="bg-pink-500 px-3 py-1 rounded mb-1 text-sm font-bold">
                      {campaign.banner?.title || 'GRAND JEU'}
                    </div>
                    <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded text-xs">
                      {campaign.banner?.subtitle || 'LECTURES DE L\'ÉTÉ'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCampaign({...campaign, banner: {...campaign.banner, image: null}})}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-gray-400">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Glissez une image ici ou cliquez pour télécharger</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="banner-upload"
            />
            {!campaign.banner?.image && (
              <label
                htmlFor="banner-upload"
                className="absolute inset-0 cursor-pointer"
              />
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Texte de description (éditable)</label>
            <textarea
              value={campaign.content?.text || ''}
              onChange={(e) => setCampaign({
                ...campaign,
                content: {
                  ...campaign.content,
                  text: e.target.value
                }
              })}
              placeholder="Entrez votre texte de description ici..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-32 resize-y"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Les sauts de ligne sont conservés. Utilisez Entrée pour créer de nouveaux paragraphes.
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Lien de la bannière (facultatif)</label>
            <input
              type="url"
              placeholder="https://www.qualifio.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Couleurs</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-orange-500">🎨</span>
            <span className="text-sm text-gray-600 w-24">Couleur de fond</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={campaign.settings?.backgroundColor || '#ffffff'}
                onChange={(e) => updateSettings('backgroundColor', e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <Palette className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-orange-500">🎨</span>
            <span className="text-sm text-gray-600 w-24">Outline color</span>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#000000"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <Palette className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioGeneralTab;
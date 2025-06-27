
import React from 'react';
import { FileText, Type, Image } from 'lucide-react';

interface ModernContentTabProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
}

const ModernContentTab: React.FC<ModernContentTabProps> = ({
  campaign,
  setCampaign
}) => {
  const updateScreens = (screenUpdates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      screens: {
        ...prev.screens,
        ...screenUpdates
      }
    }));
  };

  const updateDesign = (updates: any) => {
    setCampaign((prev: any) => ({
      ...prev,
      design: {
        ...prev.design,
        ...updates
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Contenu
        </h2>
        <p className="text-sm text-gray-600">
          Personnalisez les textes et images de votre campagne
        </p>
      </div>

      {/* Textes principaux */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Type className="w-4 h-4 mr-2" />
          Textes principaux
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Titre principal</label>
            <input
              type="text"
              value={campaign.screens?.welcome?.title || ''}
              onChange={(e) => updateScreens({ welcome: { ...campaign.screens?.welcome, title: e.target.value } })}
              placeholder="Titre de votre campagne"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sous-titre</label>
            <input
              type="text"
              value={campaign.screens?.welcome?.subtitle || ''}
              onChange={(e) => updateScreens({ welcome: { ...campaign.screens?.welcome, subtitle: e.target.value } })}
              placeholder="Sous-titre descriptif"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={campaign.screens?.welcome?.description || ''}
              onChange={(e) => updateScreens({ welcome: { ...campaign.screens?.welcome, description: e.target.value } })}
              placeholder="Description de la campagne"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Messages de résultat */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Messages de résultat</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message de victoire</label>
            <textarea
              value={campaign.screens?.win?.message || ''}
              onChange={(e) => updateScreens({ win: { ...campaign.screens?.win, message: e.target.value } })}
              placeholder="Félicitations ! Vous avez gagné !"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message de défaite</label>
            <textarea
              value={campaign.screens?.lose?.message || ''}
              onChange={(e) => updateScreens({ lose: { ...campaign.screens?.lose, message: e.target.value } })}
              placeholder="Dommage ! Tentez votre chance une prochaine fois."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Images personnalisées */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 flex items-center">
          <Image className="w-4 h-4 mr-2" />
          Images personnalisées
        </h4>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Logo</label>
            <input
              type="url"
              value={campaign.design?.logo || ''}
              onChange={(e) => updateDesign({ logo: e.target.value })}
              placeholder="URL du logo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Image de victoire</label>
            <input
              type="url"
              value={campaign.screens?.win?.image || ''}
              onChange={(e) => updateScreens({ win: { ...campaign.screens?.win, image: e.target.value } })}
              placeholder="Image affichée lors d'une victoire"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernContentTab;

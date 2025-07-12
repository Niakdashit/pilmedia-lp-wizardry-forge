import React from 'react';

interface QualifioTextTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioTextTab: React.FC<QualifioTextTabProps> = ({
  campaign,
  setCampaign
}) => {
  const updateContent = (key: string, value: string) => {
    setCampaign({
      ...campaign,
      content: {
        ...campaign.content,
        [key]: value
      }
    });
  };

  const updatePublisher = (key: string, value: string) => {
    setCampaign({
      ...campaign,
      publisher: {
        ...campaign.publisher,
        [key]: value
      }
    });
  };

  const updatePrize = (key: string, value: string) => {
    setCampaign({
      ...campaign,
      prize: {
        ...campaign.prize,
        [key]: value
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Texte de présentation</h3>
        
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Contenu principal</label>
          <textarea
            value={campaign.content?.text || ''}
            onChange={(e) => updateContent('text', e.target.value)}
            placeholder="Saisissez ici le texte de présentation de votre jeu..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-32"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce texte apparaîtra sous la bannière principale
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lien éditeur</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Nom de l'éditeur</label>
            <input
              type="text"
              value={campaign.publisher?.name || ''}
              onChange={(e) => updatePublisher('name', e.target.value)}
              placeholder="editions.flammarion.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">URL de l'éditeur</label>
            <input
              type="url"
              value={campaign.publisher?.url || ''}
              onChange={(e) => updatePublisher('url', e.target.value)}
              placeholder="https://editions.flammarion.com"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Description du lot</h3>
        
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Texte de description</label>
          <textarea
            value={campaign.prize?.description || ''}
            onChange={(e) => updatePrize('description', e.target.value)}
            placeholder="Jouez et tentez de remporter l'un des 10 exemplaires de..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-20"
          />
          <p className="text-xs text-gray-500 mt-1">
            Texte en italique qui apparaîtra avant le bouton de participation
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Styles de texte</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur du texte principal</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#1f2937"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Gris foncé</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur du lien éditeur</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#dc2626"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Rouge</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Taille de police</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Petite (12px)</option>
              <option selected>Normale (14px)</option>
              <option>Grande (16px)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Alignement du texte</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Gauche</option>
              <option>Centre</option>
              <option>Justifié</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioTextTab;
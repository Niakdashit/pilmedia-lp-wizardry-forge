import React from 'react';

interface QualifioButtonTabProps {
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioButtonTab: React.FC<QualifioButtonTabProps> = ({
  campaign,
  setCampaign
}) => {
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
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bouton de participation</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Texte du bouton</label>
            <input
              type="text"
              value={campaign.prize?.buttonText || ''}
              onChange={(e) => updatePrize('buttonText', e.target.value)}
              placeholder="PARTICIPER !"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur de fond</label>
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
            <label className="text-sm text-gray-600 mb-2 block">Couleur du texte</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#ffffff"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Blanc</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Couleur au survol</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value="#b91c1c"
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500">Rouge foncé</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Style du bouton</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Taille du bouton</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Petit</option>
              <option>Moyen</option>
              <option selected>Grand</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Forme du bouton</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option>Carré</option>
              <option selected>Arrondi</option>
              <option>Très arrondi</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Ombre portée</label>
            <div className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm text-gray-600">Activer l'ombre</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Effet au survol</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option selected>Changement de couleur</option>
              <option>Agrandissement</option>
              <option>Ombre plus marquée</option>
              <option>Aucun effet</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Boutons réseaux sociaux</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-600">Afficher Facebook</span>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-600">Afficher X (Twitter)</span>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-600">Afficher Instagram</span>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-600">Afficher LinkedIn</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bouton règlement</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-600">Afficher le bouton règlement</span>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Texte du bouton</label>
            <input
              type="text"
              defaultValue="Règlement"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Lien vers le règlement</label>
            <input
              type="url"
              placeholder="https://example.com/reglement.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioButtonTab;
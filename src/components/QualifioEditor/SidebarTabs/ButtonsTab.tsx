import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface ButtonsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ButtonsTab: React.FC<ButtonsTabProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration des boutons</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Bouton de participation</h4>
            <p className="text-sm text-gray-600 mb-4">
              Le bouton "PARTICIPER !" est affiché automatiquement dans le design.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Boutons sociaux</h4>
            <p className="text-sm text-gray-600 mb-4">
              Les boutons Facebook et X (Twitter) sont intégrés dans le header de l'image.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Bouton Règlement</h4>
            <p className="text-sm text-gray-600">
              Le bouton "Règlement" est positionné en haut à droite de l'image.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonsTab;
import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface FooterTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FooterTab: React.FC<FooterTabProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration du footer</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Le footer n'est pas utilisé dans ce design de concours. 
            Tous les éléments (texte, lien éditeur, prix) sont intégrés dans le corps principal du concours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterTab;
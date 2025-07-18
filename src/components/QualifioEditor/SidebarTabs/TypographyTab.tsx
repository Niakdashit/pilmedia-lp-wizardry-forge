
import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface TypographyTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const TypographyTab: React.FC<TypographyTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Typographie</h3>
        <p className="text-sm text-gray-600">
          Configurez les polices et styles de texte de votre campagne.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500">
          Les options de typographie seront bientôt disponibles.
        </p>
      </div>
    </div>
  );
};

export default TypographyTab;

import React from 'react';
import { Save, CheckCircle } from 'lucide-react';

interface QualifioFooterProps {
  campaign: any;
}

const QualifioFooter: React.FC<QualifioFooterProps> = ({ campaign }) => {
  const handleSave = () => {
    console.log('Sauvegarde du template:', campaign);
    // Logique de sauvegarde
  };

  const handleSaveAndExit = () => {
    console.log('Sauvegarde et fermeture:', campaign);
    // Logique de sauvegarde et redirection
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span className="font-medium">Sauvegarder le template</span>
        </button>
        
        <button
          onClick={handleSaveAndExit}
          className="flex items-center space-x-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Sauvegarder et quitter</span>
        </button>
      </div>
    </div>
  );
};

export default QualifioFooter;
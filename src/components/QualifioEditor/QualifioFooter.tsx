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
    <div className="bg-slate-700 border-t border-gray-600 px-6 py-4">
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
import React from 'react';
import { Info } from 'lucide-react';

/**
 * EmptyGamePreview - Écran vide pour le preview du jeu
 * Remplace le contenu quiz dans le ReferenceEditor
 */
const EmptyGamePreview: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Écran de Jeu Vide
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Cet espace est réservé pour votre nouvelle mécanique de jeu.
            Ajoutez ici les composants et la logique spécifiques à votre jeu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyGamePreview;

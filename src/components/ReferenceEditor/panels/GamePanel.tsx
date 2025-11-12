import React from 'react';
import { Info } from 'lucide-react';

/**
 * GamePanel - Panel vide pour l'onglet "Jeu"
 * Sert de base pour créer de nouvelles mécaniques de jeu
 */
const GamePanel: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium mb-2">
              Éditeur de Référence
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cet éditeur sert de base pour créer de nouvelles mécaniques de jeu.
              L'onglet "Jeu" est intentionnellement vide pour permettre l'ajout
              de nouveaux composants et configurations spécifiques.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-lg p-8">
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-2">
            Aucune configuration de jeu
          </div>
          <p className="text-gray-600 text-xs">
            Ajoutez ici les composants de configuration pour votre nouvelle mécanique
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamePanel;

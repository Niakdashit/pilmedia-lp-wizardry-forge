import React from 'react';

interface AnimationsTabProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const AnimationsTab: React.FC<AnimationsTabProps> = ({ config }) => {
  return (
    <div className="p-6">
      <div className="text-center py-8 text-gray-500">
        <div className="mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Animations</h3>
          <p className="text-sm text-gray-600">
            {config.displayMode === 'mode1-banner-game' 
              ? 'Les animations ne sont pas disponibles en Mode 1' 
              : 'Personnalisez les animations de vos éléments'
            }
          </p>
        </div>
        
        {config.displayMode !== 'mode1-banner-game' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              🚀 Fonctionnalité en développement
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Bientôt disponible pour animer vos textes et images personnalisés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationsTab;
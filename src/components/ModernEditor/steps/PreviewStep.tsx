
import React from 'react';
import { Eye, Smartphone, Tablet, Monitor } from 'lucide-react';
import PreviewEditBar from '../../DesignEditor/components/PreviewEditBar';

interface PreviewStepProps {
  campaign: any;
  onNext?: () => void;
  onPrev?: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  campaign,
  onNext,
  onPrev
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Eye className="w-6 h-6 mr-2 text-[#d4dbe8]" />
            Aperçu et test
          </h2>
          <p className="text-gray-600">Testez votre campagne sur différents appareils</p>
        </div>

        {/* Device Preview */}
        <div className="space-y-6">
          <div className="flex space-x-4 justify-center">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Tablet className="w-4 h-4" />
              <span>Tablette</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 text-center relative">
            <div className="w-full h-96 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <p className="text-gray-500">Aperçu de la campagne : {campaign.name}</p>
            </div>
            
            {/* Barre d'édition responsive - visible sur tous appareils */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-md lg:max-w-lg px-4">
              <PreviewEditBar
                onAddElement={(elementType) => {
                  console.log('Ajout d\'élément:', elementType);
                  // TODO: Implémenter l'ajout d'éléments en mode aperçu
                }}
                onOpenPanel={(panelType) => {
                  console.log('Ouverture du panneau:', panelType);
                  // TODO: Implémenter l'ouverture des panneaux
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onPrev}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Précédent
          </button>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-[#d4dbe8] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;

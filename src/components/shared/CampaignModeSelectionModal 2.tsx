import React from 'react';
import { Monitor, FileText } from 'lucide-react';

interface CampaignModeSelectionModalProps {
  isOpen: boolean;
  onSelect: (mode: 'fullscreen' | 'article') => void;
  onClose: () => void;
}

const CampaignModeSelectionModal: React.FC<CampaignModeSelectionModalProps> = ({
  isOpen,
  onSelect,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-3xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Choisissez le mode de votre campagne
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Sélectionnez le format qui correspond le mieux à vos besoins
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fullscreen Mode */}
          <button
            onClick={() => onSelect('fullscreen')}
            className="group relative bg-gradient-to-br from-[hsl(var(--sidebar-surface))] to-white border-2 border-[hsl(var(--sidebar-border))] rounded-xl p-6 hover:border-[hsl(var(--sidebar-glow))] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#44444d] to-[#44444d] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Campagne Plein Écran
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Expérience immersive complète avec jusqu'à 3 écrans configurables
              </p>
              <ul className="text-xs text-left text-gray-500 space-y-1">
                <li>✓ Personnalisation complète</li>
                <li>✓ Multiples modules visuels</li>
                <li>✓ Design flexible</li>
              </ul>
            </div>
          </button>

          {/* Article Mode */}
          <button
            onClick={() => onSelect('article')}
            className="group relative bg-gradient-to-br from-[hsl(var(--sidebar-surface))] to-white border-2 border-[hsl(var(--sidebar-border))] rounded-xl p-6 hover:border-[hsl(var(--sidebar-glow))] hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#44444d] to-[#44444d] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Campagne Mode Article
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Format simplifié parfait pour une intégration éditoriale
              </p>
              <ul className="text-xs text-left text-gray-500 space-y-1">
                <li>✓ Bannière + Texte + CTA</li>
                <li>✓ Design épuré</li>
                <li>✓ Intégration rapide</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignModeSelectionModal;

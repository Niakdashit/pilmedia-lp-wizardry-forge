import React from 'react';
import { X, AlertCircle, Settings } from 'lucide-react';
import { CampaignValidationError } from '@/hooks/useCampaignValidation';

interface CampaignValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: CampaignValidationError[];
  onOpenSettings: () => void;
}

/**
 * Modale d'alerte affichée quand l'utilisateur tente de sauvegarder
 * sans avoir rempli les paramètres obligatoires de la campagne
 */
const CampaignValidationModal: React.FC<CampaignValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
  onOpenSettings
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200 bg-red-50">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Paramètres incomplets
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Veuillez compléter les informations obligatoires
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Les paramètres suivants doivent être renseignés avant de sauvegarder :
            </p>

            <ul className="space-y-2 mb-6">
              {errors.map((error, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 p-3 rounded-lg"
                >
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce :</strong> Cliquez sur le bouton "Paramètres" dans la barre d'outils 
                pour configurer votre campagne.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-gradient-to-br from-[#E0004D] to-[#6B2AA0] text-white font-medium hover:from-[#E0004D] hover:to-[#4D2388] transition-all"
            >
              <Settings className="w-4 h-4" />
              Ouvrir les paramètres
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignValidationModal;

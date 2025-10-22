import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Maximize2, FileText } from 'lucide-react';

interface EditorModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'dice' | 'memory' | 'puzzle';
}

/**
 * EditorModeModal - Modale de choix entre mode Fullscreen et mode Article
 * 
 * S'affiche depuis le Dashboard lorsqu'un utilisateur clique sur un raccourci de création.
 * Propose deux options:
 * 1. Full Screen - Éditeur complet actuel
 * 2. Article - Mode simplifié avec bannière + texte + CTA
 */
const EditorModeModal: React.FC<EditorModeModalProps> = ({
  isOpen,
  onClose,
  editorType,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Routes pour chaque type d'éditeur
  const getEditorRoute = (mode: 'fullscreen' | 'article') => {
    const routes: Record<typeof editorType, string> = {
      wheel: '/design-editor',
      quiz: '/quiz-editor',
      scratch: '/scratch-editor',
      jackpot: '/jackpot-editor',
      form: '/form-editor',
      dice: '/dice-editor',
      memory: '/memory-editor',
      puzzle: '/puzzle-editor',
    };

    const baseRoute = routes[editorType] || '/design-editor';
    return `${baseRoute}?mode=${mode}`;
  };

  // Labels pour chaque type
  const getEditorLabel = () => {
    const labels: Record<typeof editorType, string> = {
      wheel: 'Roue de la Fortune',
      quiz: 'Quiz',
      scratch: 'Carte à Gratter',
      jackpot: 'Jackpot',
      form: 'Formulaire',
      dice: 'Dés',
      memory: 'Memory',
      puzzle: 'Puzzle',
    };
    return labels[editorType] || 'Campagne';
  };

  const handleModeSelect = (mode: 'fullscreen' | 'article') => {
    navigate(getEditorRoute(mode));
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Choisissez votre mode d'édition
            </h2>
            <p className="text-gray-600">
              {getEditorLabel()} - Sélectionnez le format qui correspond à vos besoins
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mode Full Screen */}
              <button
                onClick={() => handleModeSelect('fullscreen')}
                className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#841b60] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-[#841b60] to-[#b41b60] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#841b60] transition-colors">
                    Full Screen
                  </h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Éditeur complet
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Mode éditeur avancé avec tous les modules, personnalisation complète et contrôle total sur chaque élément de votre campagne.
                </p>

                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Modules illimités (textes, images, formes, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Design totalement personnalisable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Contrôle avancé des animations et effets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Responsive multi-device complet</span>
                  </li>
                </ul>

                <div className="mt-auto pt-4 border-t border-gray-200 w-full">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Idéal pour les campagnes complexes
                  </span>
                </div>
              </button>

              {/* Mode Article */}
              <button
                onClick={() => handleModeSelect('article')}
                className="group relative flex flex-col items-start p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-white hover:to-purple-50 rounded-xl border-2 border-purple-200 hover:border-[#841b60] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-[#841b60] to-[#b41b60] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#841b60] transition-colors">
                    Article
                  </h3>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    Simplifié • 810×1200px
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Mode simplifié avec structure fixe : bannière + texte descriptif + bouton CTA. Parfait pour des landing pages rapides et efficaces.
                </p>

                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Bannière toujours visible (810px)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Édition inline (double-clic)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Structure simplifiée et guidée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Création rapide en quelques minutes</span>
                  </li>
                </ul>

                <div className="mt-auto pt-4 border-t border-purple-200 w-full">
                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    Idéal pour les contenus éditoriaux
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Les deux modes supportent le même funnel complet</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorModeModal;

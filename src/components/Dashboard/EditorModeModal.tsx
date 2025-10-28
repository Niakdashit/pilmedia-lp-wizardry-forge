import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

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
  const { resetCampaign, beginNewCampaign } = useEditorStore();

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
    // 🧹 CRITICAL: Reset store completely before opening new editor from dashboard
    console.log('🧹 [EditorModeModal] Resetting editor store for new campaign');
    resetCampaign();
    
    // Mark as new campaign to prevent auto-injection from URL
    beginNewCampaign(editorType);
    
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
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-xl w-full pointer-events-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-5 py-4 border-b border-gray-100">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-800">
              Choisissez votre mode d'édition
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {getEditorLabel()} • Deux approches, un même funnel
            </p>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <div className="space-y-3">
              {/* Mode Full Screen */}
              <button
                onClick={() => handleModeSelect('fullscreen')}
                className="group flex items-center gap-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#841b60] hover:shadow-lg transition-all text-left p-3"
              >
                <div className="relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#fdf6ff] via-[#f6f7ff] to-[#ffeef5]">
                  <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_15%_20%,rgba(132,27,96,0.12),transparent_55%)]" />
                  <div className="absolute inset-[6px] rounded-md border border-[#cdb7e6]/40 bg-white/60 backdrop-blur-[2px]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#841b60] transition-colors">
                      Full Screen
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-900/10 text-gray-700">
                      Libre
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-snug">
                    Scène libre, tous les modules à portée pour un contrôle total.
                  </p>
                </div>
              </button>

              {/* Mode Article */}
              <button
                onClick={() => handleModeSelect('article')}
                className="group flex items-center gap-4 rounded-xl border border-purple-200/80 bg-white hover:border-[#841b60] hover:shadow-lg transition-all text-left p-3"
              >
                <div className="relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#fdf6ff] via-[#f6f7ff] to-[#ffeef5]">
                  <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_80%_20%,rgba(132,27,96,0.12),transparent_60%)]" />
                  <div className="absolute inset-[6px] rounded-md border border-[#cdb7e6]/40 bg-white/85" />
                  <div className="absolute inset-x-[10px] top-[10px] h-3 rounded bg-[#841b60]/45" />
                  <div className="absolute inset-x-[10px] top-[22px] h-2 rounded bg-[#841b60]/20" />
                  <div className="absolute inset-x-[10px] top-[28px] h-2 rounded bg-[#841b60]/15" />
                  <div className="absolute inset-x-[10px] bottom-[10px] h-6 rounded bg-[#f8d9ea]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#841b60] transition-colors">
                      Article
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#841b60]/10 text-[#841b60]">
                      Guidé
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-snug">
                    Bloc structuré bannière + texte, parfait pour aller à l’essentiel.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex items-center justify-between text-xs text-gray-600">
            <span>Vous pourrez changer de mode à tout moment.</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
;

export default EditorModeModal;

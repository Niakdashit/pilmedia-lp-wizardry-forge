import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  currentRevision: number;
  serverRevision: number;
  onReload: () => void;
  onOverwrite: () => void;
  onCancel: () => void;
}

export const ConflictResolutionModal = ({
  isOpen,
  currentRevision,
  serverRevision,
  onReload,
  onOverwrite,
  onCancel,
}: ConflictResolutionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Conflit de Version Détecté
              </h2>
              <p className="text-white/90 text-sm">
                Cette campagne a été modifiée ailleurs
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              La campagne a été modifiée par quelqu'un d'autre pendant que vous travailliez dessus.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Votre version:</span>
              <span className="font-mono font-semibold text-orange-600">
                rev {currentRevision}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600">Version serveur:</span>
              <span className="font-mono font-semibold text-red-600">
                rev {serverRevision}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-gray-900">Que voulez-vous faire ?</p>
            
            <div className="space-y-2">
              <button
                onClick={onReload}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  🔄 Recharger depuis le serveur
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Abandonner vos modifications locales et récupérer la dernière version
                </p>
              </button>

              <button
                onClick={onOverwrite}
                className="w-full text-left px-4 py-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="font-medium text-red-900">
                  ⚠️ Écraser avec mes modifications
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Forcer la sauvegarde de votre version (les autres modifications seront perdues)
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

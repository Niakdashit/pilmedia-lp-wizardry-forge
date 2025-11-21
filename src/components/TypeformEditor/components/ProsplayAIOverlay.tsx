import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { TypeformQuestion } from './TypeformPreview';

interface ProsplayAIOverlayProps {
  open: boolean;
  onClose: () => void;
  existingQuestions: TypeformQuestion[];
  onApply: (suggested: TypeformQuestion[]) => void;
}

const ProsplayAIOverlay: React.FC<ProsplayAIOverlayProps> = ({
  open,
  onClose,
  existingQuestions,
  onApply
}) => {
  if (!open) return null;

  // Pour la V1, on duplique simplement les questions existantes comme "suggestions" mockées
  const suggestedQuestions = existingQuestions;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">Prosplay AI</span>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5 mt-0.5">Beta</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800">Suggestions</button>
            <button className="px-3 py-1.5 rounded-full hover:bg-gray-100">Preview</button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex divide-x divide-gray-100">
          {/* Colonne chat */}
          <div className="w-1/2 flex flex-col bg-gray-50/60">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Prompt</div>
              <div className="max-w-[90%] rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-800">
                Crée un formulaire de qualification pour une entreprise de déménagement. Je veux pouvoir identifier les leads de haute qualité.
              </div>
              <div className="max-w-[90%] rounded-2xl bg-purple-50 px-4 py-3 shadow-sm border border-purple-100 text-sm text-gray-800 ml-auto">
                Prosplay AI a généré une série de questions pour qualifier les prospects (coordonnées, contexte, besoins détaillés, budget...).
              </div>
            </div>
            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                <span className="text-gray-400">Chat avec Prosplay AI pour générer ton formulaire...</span>
              </div>
            </div>
          </div>

          {/* Colonne questions suggérées */}
          <div className="w-1/2 flex flex-col bg-white">
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Questions suggérées</div>
                <div className="text-[11px] text-gray-400">Ces questions seront ajoutées à la suite de ton formulaire actuel.</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {suggestedQuestions.length === 0 && (
                <div className="text-sm text-gray-500">
                  Aucune question pour l'instant. Décris ton formulaire dans le chat pour générer des suggestions.
                </div>
              )}

              {suggestedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{q.text}</div>
                    {q.description && (
                      <div className="text-xs text-gray-500 truncate">{q.description}</div>
                    )}
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">
                      Type : {q.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => onApply(suggestedQuestions)}
                className="px-5 py-2 rounded-full text-sm font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200"
              >
                Appliquer au formulaire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsplayAIOverlay;

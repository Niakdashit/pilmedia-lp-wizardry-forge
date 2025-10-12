import React from 'react';

export interface ResultCardProps {
  /** Résultat du jeu */
  result: 'win' | 'lose';
  /** Messages personnalisés */
  messages: {
    title: string;
    message: string;
    subMessage?: string;
    buttonText: string;
    buttonAction: 'close' | 'replay' | 'redirect';
    redirectUrl?: string;
    showPrizeImage?: boolean;
  };
  /** Callback pour le bouton principal */
  onButtonClick: () => void;
  /** Callback pour le bouton "Rejouer" */
  onReplay?: () => void;
  /** Afficher le bouton "Rejouer" même si l'action principale est "replay" */
  alwaysShowReplay?: boolean;
}

/**
 * Carte de résultat unifiée pour tous les éditeurs
 * Design inspiré du scratch-editor avec fond blanc, ombre et coins arrondis
 */
export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  messages,
  onButtonClick,
  onReplay,
  alwaysShowReplay = false
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full mx-auto">
      {/* Titre principal */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
        {messages.title}
      </h2>

      {/* Message principal */}
      <p className="text-base text-gray-700 mb-2">
        {messages.message}
      </p>

      {/* Sous-message optionnel */}
      {messages.subMessage && (
        <p className="text-sm text-gray-600 mb-6">
          {messages.subMessage}
        </p>
      )}

      {/* Bouton d'action principal */}
      <button
        onClick={onButtonClick}
        className="w-full bg-black text-white px-6 py-3 rounded-full font-medium text-base hover:bg-gray-800 transition-colors duration-200 mb-3"
      >
        {messages.buttonText}
      </button>

      {/* Bouton secondaire "Rejouer" */}
      {(alwaysShowReplay || (messages.buttonAction !== 'replay' && onReplay)) && (
        <button
          onClick={onReplay}
          className="text-black text-sm underline hover:no-underline transition-all duration-200"
        >
          Rejouer
        </button>
      )}
    </div>
  );
};

export default ResultCard;

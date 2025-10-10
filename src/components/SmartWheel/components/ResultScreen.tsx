import React from 'react';

export interface ResultScreenProps {
  result: any;
  onClose?: () => void;
  onPrimaryAction?: () => void;
  className?: string;
  messages?: {
    winTitle?: string;
    winBody?: string;
    winSubMessage?: string;
    winButtonText?: string;
    winButtonAction?: 'close' | 'replay' | 'redirect';
    winRedirectUrl?: string;
    winShowPrizeImage?: boolean;
    loseTitle?: string;
    loseBody?: string;
    loseSubMessage?: string;
    loseButtonText?: string;
    loseButtonAction?: 'close' | 'replay' | 'redirect';
    loseRedirectUrl?: string;
    primaryCta?: string;
  };
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onClose,
  onPrimaryAction,
  className = '',
  messages
}) => {
  const isWin = !!(result?.hasWon || result?.assignedPrize || result?.isWinning);
  const title = isWin
    ? (messages?.winTitle || 'Félicitations !')
    : (messages?.loseTitle || 'Merci pour votre participation');
  const body = isWin
    ? (messages?.winBody || "Vous avez gagné ! Nous vous recontacterons avec les détails.")
    : (messages?.loseBody || "Dommage, ce n'est pas pour cette fois. Tentez votre chance une prochaine fois !");
  const sub = isWin ? (messages?.winSubMessage || '') : (messages?.loseSubMessage || '');
  const cta = isWin
    ? (messages?.winButtonText || messages?.primaryCta || 'Continuer')
    : (messages?.loseButtonText || messages?.primaryCta || 'Continuer');

  return (
    <div className={`w-full max-w-xl mx-auto bg-white rounded-xl shadow-2xl border p-6 text-center ${className}`}>
      <div className="mb-3 text-2xl font-bold text-gray-900">{title}</div>
      <div className="mb-2 text-gray-700">{body}</div>
      {!!sub && <div className="mb-6 text-gray-500 text-sm">{sub}</div>}

      {isWin && messages?.winShowPrizeImage && result?.assignedPrize?.imageUrl && (
        <div className="mb-4 flex items-center justify-center">
          <img src={result.assignedPrize.imageUrl} alt="Lot gagné" className="max-h-24 rounded-md border" />
        </div>
      )}
      {result?.assignedPrize && (
        <div className="mb-6 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
          Lot: <span className="ml-2 font-semibold">{result.assignedPrize.name || 'Votre lot'}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
        )}
        <button
          onClick={onPrimaryAction}
          className="inline-flex items-center px-4 py-2 text-sm rounded-xl bg-gradient-to-br from-[#841b60] to-[#b41b60] backdrop-blur-sm text-white font-medium border border-white/20 shadow-lg shadow-[#841b60]/20 hover:from-[#841b60] hover:to-[#6d164f] hover:shadow-xl hover:shadow-[#841b60]/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {cta}
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;

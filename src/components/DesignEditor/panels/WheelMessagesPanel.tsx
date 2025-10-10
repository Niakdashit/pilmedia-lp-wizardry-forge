import React, { useState } from 'react';
import { Trophy, Frown, MessageSquareText } from 'lucide-react';

interface WheelMessagesPanelProps {
  campaign?: any;
  setCampaign?: (updater: any) => void;
}

const WheelMessagesPanel: React.FC<WheelMessagesPanelProps> = ({ campaign, setCampaign }) => {
  const [activeSection, setActiveSection] = useState<'winner' | 'loser' | 'common'>('winner');

  const flat = campaign?.game?.messages || {};
  const nestedWinner = campaign?.game?.messages?.winner || {};
  const nestedLoser = campaign?.game?.messages?.loser || {};
  // Winner defaults
  const winTitle = nestedWinner.title || flat.winTitle || '🎉 Félicitations !';
  const winBody = nestedWinner.message || flat.winBody || 'Votre participation est validée et vous avez gagné.';
  const winSubMessage = nestedWinner.subMessage || flat.winSubMessage || '';
  const winButtonText = nestedWinner.buttonText || flat.winButtonText || flat.primaryCta || 'Continuer';
  const winButtonAction = nestedWinner.buttonAction || flat.winButtonAction || 'close';
  const winRedirectUrl = nestedWinner.redirectUrl || flat.winRedirectUrl || '';
  const winShowPrizeImage = nestedWinner.showPrizeImage ?? flat.winShowPrizeImage ?? true;
  // Loser defaults
  const loseTitle = nestedLoser.title || flat.loseTitle || 'Merci pour votre participation';
  const loseBody = nestedLoser.message || flat.loseBody || "Cette fois ce n'était pas gagnant. À bientôt !";
  const loseSubMessage = nestedLoser.subMessage || flat.loseSubMessage || '';
  const loseButtonText = nestedLoser.buttonText || flat.loseButtonText || 'Rejouer';
  const loseButtonAction = nestedLoser.buttonAction || flat.loseButtonAction || 'replay';
  const loseRedirectUrl = nestedLoser.redirectUrl || flat.loseRedirectUrl || '';
  // Common
  const primaryCta = flat.primaryCta || winButtonText;

  const updateMessages = (patch: any) => {
    if (!setCampaign) return;
    setCampaign((prev: any) => ({
      ...prev,
      game: {
        ...(prev?.game || {}),
        messages: {
          ...(prev?.game?.messages || {}),
          ...patch,
          // Keep nested compatibility
          winner: {
            ...(prev?.game?.messages?.winner || {}),
            title: patch.winTitle ?? (prev?.game?.messages?.winner?.title),
            message: patch.winBody ?? (prev?.game?.messages?.winner?.message),
            subMessage: patch.winSubMessage ?? (prev?.game?.messages?.winner?.subMessage),
            buttonText: patch.winButtonText ?? (prev?.game?.messages?.winner?.buttonText),
            buttonAction: patch.winButtonAction ?? (prev?.game?.messages?.winner?.buttonAction),
            redirectUrl: patch.winRedirectUrl ?? (prev?.game?.messages?.winner?.redirectUrl),
            showPrizeImage: (patch.winShowPrizeImage !== undefined) ? patch.winShowPrizeImage : (prev?.game?.messages?.winner?.showPrizeImage),
          },
          loser: {
            ...(prev?.game?.messages?.loser || {}),
            title: patch.loseTitle ?? (prev?.game?.messages?.loser?.title),
            message: patch.loseBody ?? (prev?.game?.messages?.loser?.message),
            subMessage: patch.loseSubMessage ?? (prev?.game?.messages?.loser?.subMessage),
            buttonText: patch.loseButtonText ?? (prev?.game?.messages?.loser?.buttonText),
            buttonAction: patch.loseButtonAction ?? (prev?.game?.messages?.loser?.buttonAction),
            redirectUrl: patch.loseRedirectUrl ?? (prev?.game?.messages?.loser?.redirectUrl),
          },
        },
      },
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages de sortie</h2>
        <p className="text-sm text-gray-500 mt-1">Personnalisez les textes affichés après le tirage</p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => setActiveSection('winner')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'winner' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Gagnant
        </button>
        <button
          onClick={() => setActiveSection('loser')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'loser' ? 'bg-orange-50 text-orange-700 border-2 border-orange-200' : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <Frown className="w-4 h-4" />
          Perdant
        </button>
        <button
          onClick={() => setActiveSection('common')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'common' ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200' : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <MessageSquareText className="w-4 h-4" />
          Commun
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'winner' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal</label>
              <input type="text" value={winTitle} onChange={(e) => updateMessages({ winTitle: e.target.value })} placeholder="🎉 Félicitations !" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message principal</label>
              <textarea rows={3} value={winBody} onChange={(e) => updateMessages({ winBody: e.target.value })} placeholder="Vous avez gagné !" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-message (optionnel)</label>
              <input type="text" value={winSubMessage} onChange={(e) => updateMessages({ winSubMessage: e.target.value })} placeholder="Un email de confirmation vous a été envoyé" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <input type="checkbox" id="showPrizeImage" checked={!!winShowPrizeImage} onChange={(e) => updateMessages({ winShowPrizeImage: e.target.checked })} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
              <label htmlFor="showPrizeImage" className="text-sm text-gray-700 cursor-pointer">Afficher l'image du prix gagné</label>
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
                  <input type="text" value={winButtonText} onChange={(e) => updateMessages({ winButtonText: e.target.value, primaryCta: e.target.value })} placeholder="Continuer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action du bouton</label>
                  <select value={winButtonAction} onChange={(e) => updateMessages({ winButtonAction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="close">Fermer la fenêtre</option>
                    <option value="replay">Rejouer</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>
                {winButtonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de redirection</label>
                    <input type="url" value={winRedirectUrl} onChange={(e) => updateMessages({ winRedirectUrl: e.target.value })} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'loser' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal</label>
              <input type="text" value={loseTitle} onChange={(e) => updateMessages({ loseTitle: e.target.value })} placeholder="Merci pour votre participation" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message principal</label>
              <textarea rows={3} value={loseBody} onChange={(e) => updateMessages({ loseBody: e.target.value })} placeholder="Merci pour votre participation !" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-message (optionnel)</label>
              <input type="text" value={loseSubMessage} onChange={(e) => updateMessages({ loseSubMessage: e.target.value })} placeholder="Tentez votre chance une prochaine fois" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
                  <input type="text" value={loseButtonText} onChange={(e) => updateMessages({ loseButtonText: e.target.value })} placeholder="Rejouer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action du bouton</label>
                  <select value={loseButtonAction} onChange={(e) => updateMessages({ loseButtonAction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="replay">Rejouer</option>
                    <option value="close">Fermer la fenêtre</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>
                {loseButtonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de redirection</label>
                    <input type="url" value={loseRedirectUrl} onChange={(e) => updateMessages({ loseRedirectUrl: e.target.value })} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'common' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton (CTA)</label>
              <input
                type="text"
                value={primaryCta}
                onChange={(e) => updateMessages({ primaryCta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Continuer"
              />
            </div>
            <p className="text-xs text-gray-500">Ce texte est utilisé pour le bouton principal de l'écran de résultat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WheelMessagesPanel;

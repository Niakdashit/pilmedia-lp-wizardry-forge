import React, { useState, useEffect } from 'react';
import { Trophy, Frown } from 'lucide-react';

interface MessagesPanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ campaign, setCampaign }) => {
  const [activeSection, setActiveSection] = useState<'winner' | 'loser'>('loser');
  
  // Émettre un événement quand l'onglet change pour mettre à jour l'aperçu
  useEffect(() => {
    const event = new CustomEvent('resultMessageTabChange', { 
      detail: { activeTab: activeSection } 
    });
    window.dispatchEvent(event);
  }, [activeSection]);

  const winnerMessages = campaign?.scratchResultMessages?.winner || {
    title: '🎉 Félicitations !',
    message: 'Vous avez gagné !',
    subMessage: 'Un email de confirmation vous a été envoyé',
    buttonText: 'Fermer',
    buttonAction: 'close',
    redirectUrl: '',
    showPrizeImage: true
  };

  const loserMessages = campaign?.scratchResultMessages?.loser || {
    title: 'Dommage ! Tentez votre chance une prochaine fois.',
    message: 'Merci pour votre participation !',
    subMessage: '',
    buttonText: 'Rejouer',
    buttonAction: 'replay',
    redirectUrl: ''
  };

  const updateWinnerMessage = (updates: any) => {
    if (!setCampaign) return;
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      scratchResultMessages: {
        ...prev?.scratchResultMessages,
        winner: { ...winnerMessages, ...updates }
      }
    }));
  };

  const updateLoserMessage = (updates: any) => {
    if (!setCampaign) return;
    setCampaign((prev: any) => ({
      ...prev,
      name: prev?.name || 'Campaign',
      scratchResultMessages: {
        ...prev?.scratchResultMessages,
        loser: { ...loserMessages, ...updates }
      }
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages de sortie</h2>
        <p className="text-sm text-gray-500 mt-1">Personnalisez les messages selon le résultat</p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-2">
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'winner' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal</label>
              <input type="text" value={winnerMessages.title} onChange={(e) => updateWinnerMessage({ title: e.target.value })} placeholder="🎉 Félicitations !" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message principal</label>
              <textarea value={winnerMessages.message} onChange={(e) => updateWinnerMessage({ message: e.target.value })} placeholder="Vous avez gagné !" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-message (optionnel)</label>
              <input type="text" value={winnerMessages.subMessage || ''} onChange={(e) => updateWinnerMessage({ subMessage: e.target.value })} placeholder="Un email de confirmation vous a été envoyé" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <input type="checkbox" id="showPrizeImage" checked={winnerMessages.showPrizeImage} onChange={(e) => updateWinnerMessage({ showPrizeImage: e.target.checked })} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
              <label htmlFor="showPrizeImage" className="text-sm text-gray-700 cursor-pointer">Afficher l'image du prix gagné</label>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
                  <input type="text" value={winnerMessages.buttonText} onChange={(e) => updateWinnerMessage({ buttonText: e.target.value })} placeholder="Fermer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action du bouton</label>
                  <select value={winnerMessages.buttonAction} onChange={(e) => updateWinnerMessage({ buttonAction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="close">Fermer la fenêtre</option>
                    <option value="replay">Rejouer</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>

                {winnerMessages.buttonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de redirection</label>
                    <input type="url" value={winnerMessages.redirectUrl || ''} onChange={(e) => updateWinnerMessage({ redirectUrl: e.target.value })} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre principal</label>
              <input type="text" value={loserMessages.title} onChange={(e) => updateLoserMessage({ title: e.target.value })} placeholder="Dommage !" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message principal</label>
              <textarea value={loserMessages.message} onChange={(e) => updateLoserMessage({ message: e.target.value })} placeholder="Merci pour votre participation !" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-message (optionnel)</label>
              <input type="text" value={loserMessages.subMessage || ''} onChange={(e) => updateLoserMessage({ subMessage: e.target.value })} placeholder="Tentez votre chance une prochaine fois" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
                  <input type="text" value={loserMessages.buttonText} onChange={(e) => updateLoserMessage({ buttonText: e.target.value })} placeholder="Rejouer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action du bouton</label>
                  <select value={loserMessages.buttonAction} onChange={(e) => updateLoserMessage({ buttonAction: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    <option value="replay">Rejouer</option>
                    <option value="close">Fermer la fenêtre</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>

                {loserMessages.buttonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de redirection</label>
                    <input type="url" value={loserMessages.redirectUrl || ''} onChange={(e) => updateLoserMessage({ redirectUrl: e.target.value })} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;

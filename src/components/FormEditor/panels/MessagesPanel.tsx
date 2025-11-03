import React, { useState, useEffect } from 'react';
import { Trophy, Frown } from 'lucide-react';
import { useMessageStore } from '@/stores/messageStore';

interface MessagesPanelProps {
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ 
  campaignConfig, 
  onCampaignConfigChange 
}) => {
  const [activeSection, setActiveSection] = useState<'winner' | 'loser'>('loser');
  const isNeutralConfirmation = (campaignConfig?.type === 'form') || (campaignConfig?.resultMode === 'confirmation');
  
  // Émettre un événement pour mettre à jour l'aperçu (ignorer le toggle en mode neutre)
  useEffect(() => {
    if (isNeutralConfirmation) return;
    const event = new CustomEvent('resultMessageTabChange', { 
      detail: { activeTab: activeSection } 
    });
    window.dispatchEvent(event);
  }, [activeSection, isNeutralConfirmation]);
  
  // Utiliser le store Zustand persistant
  const { messages, setWinnerMessage, setLoserMessage } = useMessageStore();
  
  const winnerMessages = messages.winner;
  const loserMessages = messages.loser;

  // Synchroniser le store avec campaignConfig au montage (hors mode neutre)
  useEffect(() => {
    if (isNeutralConfirmation) return;
    if (campaignConfig?.resultMessages) {
      if (campaignConfig.resultMessages.winner) {
        setWinnerMessage(campaignConfig.resultMessages.winner);
      }
      if (campaignConfig.resultMessages.loser) {
        setLoserMessage(campaignConfig.resultMessages.loser);
      }
    }
  }, [isNeutralConfirmation]);

  // Synchroniser le store vers campaignConfig à chaque modification (hors mode neutre)
  useEffect(() => {
    if (isNeutralConfirmation) return;
    if (onCampaignConfigChange) {
      onCampaignConfigChange({
        ...campaignConfig,
        resultMessages: messages
      });
    }
  }, [messages, isNeutralConfirmation]);

  const updateWinnerMessage = (updates: any) => {
    setWinnerMessage(updates);
  };

  const updateLoserMessage = (updates: any) => {
    setLoserMessage(updates);
  };

  // Gestion de la configuration de confirmation (mode neutre)
  const confirmation = campaignConfig?.resultMessages?.confirmation || {
    title: 'Merci !',
    message: 'Votre participation a été enregistrée.',
    subMessage: 'Vous recevrez une confirmation par email.',
    buttonText: 'Fermer',
    buttonAction: 'close',
    redirectUrl: ''
  };

  const updateConfirmation = (updates: any) => {
    if (!onCampaignConfigChange) return;
    const next = {
      ...(campaignConfig || {}),
      resultMessages: {
        ...(campaignConfig?.resultMessages || {}),
        confirmation: { ...confirmation, ...updates }
      },
      // Verrouiller le mode confirmation si on édite ici
      resultMode: 'confirmation'
    };
    onCampaignConfigChange(next);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages de sortie</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isNeutralConfirmation ? 'Message de confirmation d\'inscription' : 'Personnalisez les messages selon le résultat'}
        </p>
      </div>

      {/* Mode neutre: éditeur simple */}
      {isNeutralConfirmation ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Titre principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              value={confirmation.title}
              onChange={(e) => updateConfirmation({ title: e.target.value })}
              placeholder="Merci !"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Message principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message principal
            </label>
            <textarea
              value={confirmation.message}
              onChange={(e) => updateConfirmation({ message: e.target.value })}
              placeholder="Votre participation a été enregistrée."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Sous-message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-message (optionnel)
            </label>
            <input
              type="text"
              value={confirmation.subMessage || ''}
              onChange={(e) => updateConfirmation({ subMessage: e.target.value })}
              placeholder="Vous recevrez une confirmation par email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Bouton d'action */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
            <div className="space-y-3">
              {/* Texte du bouton */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={confirmation.buttonText}
                  onChange={(e) => updateConfirmation({ buttonText: e.target.value })}
                  placeholder="Fermer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Action du bouton */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action du bouton
                </label>
                <select
                  value={confirmation.buttonAction}
                  onChange={(e) => updateConfirmation({ buttonAction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="close">Fermer la fenêtre</option>
                  <option value="redirect">Rediriger vers une URL</option>
                </select>
              </div>

              {/* URL de redirection */}
              {confirmation.buttonAction === 'redirect' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de redirection
                  </label>
                  <input
                    type="url"
                    value={confirmation.redirectUrl || ''}
                    onChange={(e) => updateConfirmation({ redirectUrl: e.target.value })}
                    placeholder="https://exemple.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Toggle Gagnant / Perdant */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-2">
        <button
          onClick={() => setActiveSection('winner')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'winner'
              ? 'bg-green-50 text-green-700 border-2 border-green-200'
              : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Gagnant
        </button>
        <button
          onClick={() => setActiveSection('loser')}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'loser'
              ? 'bg-orange-50 text-orange-700 border-2 border-orange-200'
              : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <Frown className="w-4 h-4" />
          Perdant
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'winner' ? (
          /* Section Gagnant */
          <div className="space-y-4">
            {/* Titre principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={winnerMessages.title}
                onChange={(e) => updateWinnerMessage({ title: e.target.value })}
                placeholder="🎉 Félicitations !"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Message principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message principal
              </label>
              <textarea
                value={winnerMessages.message}
                onChange={(e) => updateWinnerMessage({ message: e.target.value })}
                placeholder="Vous avez gagné !"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Sous-message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-message (optionnel)
              </label>
              <input
                type="text"
                value={winnerMessages.subMessage || ''}
                onChange={(e) => updateWinnerMessage({ subMessage: e.target.value })}
                placeholder="Un email de confirmation vous a été envoyé"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Afficher image du prix */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <input
                type="checkbox"
                id="showPrizeImage"
                checked={winnerMessages.showPrizeImage}
                onChange={(e) => updateWinnerMessage({ showPrizeImage: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="showPrizeImage" className="text-sm text-gray-700 cursor-pointer">
                Afficher l'image du prix gagné
              </label>
            </div>

            {/* Bouton d'action */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                {/* Texte du bouton */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={winnerMessages.buttonText}
                    onChange={(e) => updateWinnerMessage({ buttonText: e.target.value })}
                    placeholder="Fermer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Action du bouton */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action du bouton
                  </label>
                  <select
                    value={winnerMessages.buttonAction}
                    onChange={(e) => updateWinnerMessage({ buttonAction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="close">Fermer la fenêtre</option>
                    <option value="replay">Rejouer</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>

                {/* URL de redirection */}
                {winnerMessages.buttonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de redirection
                    </label>
                    <input
                      type="url"
                      value={winnerMessages.redirectUrl || ''}
                      onChange={(e) => updateWinnerMessage({ redirectUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Section Perdant */
          <div className="space-y-4">
            {/* Titre principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal
              </label>
              <input
                type="text"
                value={loserMessages.title}
                onChange={(e) => updateLoserMessage({ title: e.target.value })}
                placeholder="Dommage ! Tentez votre chance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Message principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message principal
              </label>
              <textarea
                value={loserMessages.message}
                onChange={(e) => updateLoserMessage({ message: e.target.value })}
                placeholder="Merci pour votre participation !"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Sous-message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-message (optionnel)
              </label>
              <input
                type="text"
                value={loserMessages.subMessage || ''}
                onChange={(e) => updateLoserMessage({ subMessage: e.target.value })}
                placeholder="Tentez votre chance une prochaine fois"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Bouton d'action */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Bouton d'action</h3>
              <div className="space-y-3">
                {/* Texte du bouton */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={loserMessages.buttonText}
                    onChange={(e) => updateLoserMessage({ buttonText: e.target.value })}
                    placeholder="Rejouer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Action du bouton */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action du bouton
                  </label>
                  <select
                    value={loserMessages.buttonAction}
                    onChange={(e) => updateLoserMessage({ buttonAction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="replay">Rejouer</option>
                    <option value="close">Fermer la fenêtre</option>
                    <option value="redirect">Rediriger vers une URL</option>
                  </select>
                </div>

                {/* URL de redirection */}
                {loserMessages.buttonAction === 'redirect' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de redirection
                    </label>
                    <input
                      type="url"
                      value={loserMessages.redirectUrl || ''}
                      onChange={(e) => updateLoserMessage({ redirectUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default MessagesPanel;

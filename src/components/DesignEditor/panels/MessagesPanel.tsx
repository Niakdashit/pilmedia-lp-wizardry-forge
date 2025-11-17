// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Frown, Image as ImageIcon, MessageSquare, Upload, X } from 'lucide-react';
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
  const winnerImageInputRef = useRef<HTMLInputElement>(null);
  const loserImageInputRef = useRef<HTMLInputElement>(null);
  
  // Émettre un événement quand l'onglet change pour mettre à jour l'aperçu
  useEffect(() => {
    const event = new CustomEvent('resultMessageTabChange', { 
      detail: { activeTab: activeSection } 
    });
    window.dispatchEvent(event);
  }, [activeSection]);
  
  // Utiliser le store Zustand persistant
  const { messages, setWinnerMessage, setLoserMessage } = useMessageStore();
  
  const winnerMessages = messages.winner;
  const loserMessages = messages.loser;

  // Synchroniser le store avec campaignConfig au montage
  useEffect(() => {
    if (campaignConfig?.resultMessages) {
      // Si campaignConfig a des messages, les charger dans le store
      if (campaignConfig.resultMessages.winner) {
        setWinnerMessage(campaignConfig.resultMessages.winner);
      }
      if (campaignConfig.resultMessages.loser) {
        setLoserMessage(campaignConfig.resultMessages.loser);
      }
    }
  }, []);

  // Synchroniser le store vers campaignConfig à chaque modification
  useEffect(() => {
    if (onCampaignConfigChange) {
      onCampaignConfigChange({
        ...campaignConfig,
        resultMessages: messages
      });
    }
  }, [messages]);

  const updateWinnerMessage = (updates: any) => {
    setWinnerMessage(updates);
  };

  const updateLoserMessage = (updates: any) => {
    setLoserMessage(updates);
  };

  // Gestion de l'upload d'image pour le gagnant
  const handleWinnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateWinnerMessage({ backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion de l'upload d'image pour le perdant
  const handleLoserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLoserMessage({ backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f4f6]">
      {/* Header + contexte écran */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-white">
        <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Écran 4
        </p>
        <h2 className="mt-1 text-lg font-semibold text-gray-900">Messages de sortie</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 space-y-5">
        {/* Carte astuce */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Astuce :</span>{' '}
            Personnalisez les messages affichés selon que le joueur gagne ou perd.
          </p>
        </div>

        {/* Choix du message à éditer */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">Message à éditer</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveSection('winner')}
              className={`flex flex-col items-start justify-between rounded-xl border px-4 py-3 text-left shadow-sm transition-all ${
                activeSection === 'winner'
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-200 bg-gray-50 hover:bg-white'
              }`}
            >
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                🎉 <span>Message GAGNANT</span>
              </span>
              <span className="mt-1 text-xs text-gray-500">
                Affiché quand le joueur gagne un lot.
              </span>
            </button>

            <button
              onClick={() => setActiveSection('loser')}
              className={`flex flex-col items-start justify-between rounded-xl border px-4 py-3 text-left shadow-sm transition-all ${
                activeSection === 'loser'
                  ? 'border-orange-400 bg-orange-500 text-white'
                  : 'border-orange-200 bg-orange-50 hover:bg-orange-100'
              }`}
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                😞 <span>Message PERDANT</span>
              </span>
              <span className="mt-1 text-xs opacity-90">
                Affiché quand le joueur ne gagne rien (segment sans dotation).
              </span>
            </button>
          </div>
        </div>

        {/* Carte principale d'édition */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              {activeSection === 'winner' ? '🎉 Édition du message GAGNANT' : '😞 Édition du message PERDANT'}
            </p>
            <p className="text-xs text-gray-500">
              Le contenu ci-dessous sera affiché automatiquement sur l'écran de résultat.
            </p>
          </div>

          {activeSection === 'winner' ? (
          /* Section Gagnant */
          <div className="space-y-4">
            {/* Choix du type d'affichage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'affichage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateWinnerMessage({ displayType: 'message' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    (winnerMessages.displayType || 'message') === 'message'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-medium">Message</span>
                </button>
                <button
                  onClick={() => updateWinnerMessage({ displayType: 'image' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    winnerMessages.displayType === 'image'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Image de fond</span>
                </button>
              </div>
            </div>

            {/* Contenu conditionnel selon le type */}
            {(winnerMessages.displayType || 'message') === 'message' ? (
              <>
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
              </>
            ) : (
              /* Section Upload d'image */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Image de fond gagnant
                  </label>
                  
                  {winnerMessages.backgroundImage ? (
                    <div className="relative">
                      <img
                        src={winnerMessages.backgroundImage}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                      />
                      <button
                        onClick={() => updateWinnerMessage({ backgroundImage: null })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => winnerImageInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all flex flex-col items-center justify-center gap-3 text-green-600"
                    >
                      <Upload className="w-8 h-8" />
                      <div className="text-center">
                        <p className="font-medium">Cliquez pour uploader</p>
                        <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={winnerImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWinnerImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Bouton d'action */}
            <div className="pt-4 border-t border-gray-100">
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
            {/* Choix du type d'affichage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type d'affichage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateLoserMessage({ displayType: 'message' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    (loserMessages.displayType || 'message') === 'message'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-xs font-medium">Message</span>
                </button>
                <button
                  onClick={() => updateLoserMessage({ displayType: 'image' })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                    loserMessages.displayType === 'image'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Image de fond</span>
                </button>
              </div>
            </div>

            {/* Contenu conditionnel selon le type */}
            {(loserMessages.displayType || 'message') === 'message' ? (
              <>
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
              </>
            ) : (
              /* Section Upload d'image */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Image de fond perdant
                  </label>
                  
                  {loserMessages.backgroundImage ? (
                    <div className="relative">
                      <img
                        src={loserMessages.backgroundImage}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg border-2 border-orange-200"
                      />
                      <button
                        onClick={() => updateLoserMessage({ backgroundImage: null })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => loserImageInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-3 text-orange-600"
                    >
                      <Upload className="w-8 h-8" />
                      <div className="text-center">
                        <p className="font-medium">Cliquez pour uploader</p>
                        <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={loserImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLoserImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

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
      </div>
    </div>
  );
};

export default MessagesPanel;

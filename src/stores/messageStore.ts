import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResultMessage {
  title: string;
  message: string;
  subMessage?: string;
  buttonText: string;
  buttonAction: 'close' | 'replay' | 'redirect';
  redirectUrl?: string;
  showPrizeImage?: boolean;
}

export interface MessageState {
  messages: {
    winner: ResultMessage;
    loser: ResultMessage;
  };
  setWinnerMessage: (updates: Partial<ResultMessage>) => void;
  setLoserMessage: (updates: Partial<ResultMessage>) => void;
  setMessage: (type: 'winner' | 'loser', updates: Partial<ResultMessage>) => void;
  resetMessages: () => void;
}

const defaultMessages = {
  winner: {
    title: '🎉 Félicitations !',
    message: 'Vous avez gagné !',
    subMessage: 'Un email de confirmation vous a été envoyé',
    buttonText: 'Fermer',
    buttonAction: 'close' as const,
    redirectUrl: '',
    showPrizeImage: true
  },
  loser: {
    title: '😞 Dommage !',
    message: 'Merci pour votre participation !',
    subMessage: 'Tentez votre chance une prochaine fois',
    buttonText: 'Rejouer',
    buttonAction: 'replay' as const,
    redirectUrl: ''
  }
};

/**
 * Store Zustand persistant pour les messages de résultat
 * Synchronise automatiquement entre l'édition et le preview via localStorage
 */
export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messages: defaultMessages,

      setWinnerMessage: (updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            winner: { ...state.messages.winner, ...updates }
          }
        })),

      setLoserMessage: (updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            loser: { ...state.messages.loser, ...updates }
          }
        })),

      setMessage: (type, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [type]: { ...state.messages[type], ...updates }
          }
        })),

      resetMessages: () =>
        set({ messages: defaultMessages })
    }),
    {
      name: 'pilmedia-result-messages',
      version: 1,
      // Utiliser localStorage pour la persistance
      getStorage: () => localStorage,
      // Optionnel: migrer les anciennes versions si nécessaire
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration de la version 0 vers 1
          return {
            ...persistedState,
            messages: {
              winner: { ...defaultMessages.winner, ...persistedState.messages?.winner },
              loser: { ...defaultMessages.loser, ...persistedState.messages?.loser }
            }
          };
        }
        return persistedState as MessageState;
      }
    }
  )
);

/**
 * Hook pour synchroniser le store avec campaignConfig
 * Utile pour la compatibilité avec le système existant
 */
export const useSyncMessagesWithCampaign = (
  campaignConfig: any,
  onCampaignConfigChange: (config: any) => void
) => {
  const { messages, setMessage } = useMessageStore();

  // Synchroniser du store vers campaignConfig
  const syncToConfig = () => {
    if (onCampaignConfigChange) {
      onCampaignConfigChange({
        ...campaignConfig,
        resultMessages: messages
      });
    }
  };

  // Synchroniser de campaignConfig vers le store
  const syncFromConfig = () => {
    if (campaignConfig?.resultMessages) {
      if (campaignConfig.resultMessages.winner) {
        setMessage('winner', campaignConfig.resultMessages.winner);
      }
      if (campaignConfig.resultMessages.loser) {
        setMessage('loser', campaignConfig.resultMessages.loser);
      }
    }
  };

  return {
    messages,
    setMessage,
    syncToConfig,
    syncFromConfig
  };
};

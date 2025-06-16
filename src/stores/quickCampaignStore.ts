
import { create } from 'zustand';
import { QuickCampaignState, QuickCampaignActions } from '../types/quickCampaign';
import { initialState } from './quickCampaign/initialState';
import { createActions } from './quickCampaign/actions';
import { generatePreviewCampaign } from './quickCampaign/campaignGenerator';

type QuickCampaignStore = QuickCampaignState & QuickCampaignActions;

export const useQuickCampaignStore = create<QuickCampaignStore>((set, get) => ({
  ...initialState,
  ...createActions(set, get),
  
  generatePreviewCampaign: () => {
    const state = get();
    return generatePreviewCampaign(state);
  },

  reset: () => set(initialState)
}));

// Export du type pour la compatibilité
export interface { QuickCampaignState };

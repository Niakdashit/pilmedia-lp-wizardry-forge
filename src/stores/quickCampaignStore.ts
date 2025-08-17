import { create } from 'zustand';

export type GameType = 'wheel' | 'scratch' | 'quiz' | string;

interface QuickCampaignState {
  campaignName: string;
  selectedGameType: GameType;
  segmentCount: number;
  setCampaignName: (name: string) => void;
  reset: () => void;
  setSelectedGameType: (t: GameType) => void;
  setSegmentCount: (n: number) => void;
  generatePreviewCampaign: () => any;
}

const DEFAULT_NAME = 'Ma Nouvelle Campagne';

export const useQuickCampaignStore = create<QuickCampaignState>((set, get) => ({
  campaignName: DEFAULT_NAME,
  selectedGameType: 'wheel',
  segmentCount: 6,
  setCampaignName: (name) => set({ campaignName: name }),
  reset: () => set({ campaignName: DEFAULT_NAME, selectedGameType: 'wheel', segmentCount: 6 }),
  setSelectedGameType: (t) => set({ selectedGameType: t }),
  setSegmentCount: (n) => set({ segmentCount: Math.max(1, Math.floor(n)) }),
  generatePreviewCampaign: () => {
    const { segmentCount } = get();
    const segments = Array.from({ length: segmentCount }, (_, i) => ({ label: String.fromCharCode(65 + (i % 26)) }));
    return {
      config: {
        roulette: {
          segments,
          segmentColor1: '#111111',
          segmentColor2: '#222222',
        },
      },
      design: {
        background: { type: 'color', value: '#000000' },
      },
    };
  },
}));

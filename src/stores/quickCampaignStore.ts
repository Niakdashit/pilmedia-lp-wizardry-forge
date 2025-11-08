import { create } from 'zustand';

export type GameType = 'wheel' | 'scratch' | 'quiz' | string;

interface QuickCampaignState {
  campaignName: string;
  selectedGameType: GameType;
  segmentCount: number;
  currentStep: number;
  launchDate: string;
  backgroundImage: File | null;
  backgroundImageUrl: string | null;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    textColor?: string;
    buttonStyle?: string;
  };
  jackpotColors: {
    containerBackgroundColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    slotBorderColor: string;
    slotBorderWidth: number;
    slotBackgroundColor: string;
  };
  quizQuestions: any[];
  advancedMode: boolean;
  wheelCustomization: any;
  customPointer: any;
  wheelCenter: any;
  gamePosition: string;
  monetization: any;
  extensions: any[];
  segmentOverlays: any;
  setCampaignName: (name: string) => void;
  reset: () => void;
  setSelectedGameType: (t: GameType) => void;
  setSegmentCount: (n: number) => void;
  generatePreviewCampaign: () => any;
  setCurrentStep: (step: number) => void;
  setLaunchDate: (date: string) => void;
  setBackgroundImage: (file: File | null) => void;
  setBackgroundImageUrl: (url: string | null) => void;
  setCustomColors: (colors: any) => void;
  setJackpotColors: (colors: any) => void;
  setQuizQuestions: (questions: any[]) => void;
  setAdvancedMode: (enabled: boolean) => void;
  setWheelCustomization: (customization: any) => void;
  setCustomPointer: (pointer: any) => void;
  setWheelCenter: (center: any) => void;
  setGamePosition: (position: string) => void;
  setPricingPlan: (plan: string) => void;
  setLeadCapture: (enabled: boolean) => void;
  setAnalytics: (enabled: boolean) => void;
  toggleExtension: (extensionId: string) => void;
  setSegmentOverlays: (overlays: any) => void;
}

const DEFAULT_NAME = 'Ma Nouvelle Campagne';

export const useQuickCampaignStore = create<QuickCampaignState>((set, get) => ({
  campaignName: DEFAULT_NAME,
  selectedGameType: 'wheel',
  segmentCount: 6,
  currentStep: 1,
  launchDate: '',
  backgroundImage: null,
  backgroundImageUrl: null,
  customColors: { primary: '#841b60', secondary: '#dc2626', accent: '#ffffff', textColor: '#000000', buttonStyle: 'modern' },
  jackpotColors: {
    containerBackgroundColor: '#000000',
    backgroundColor: '#1a1a1a',
    borderColor: '#ffd700',
    borderWidth: 4,
    slotBorderColor: '#ffffff',
    slotBorderWidth: 2,
    slotBackgroundColor: '#000000'
  },
  quizQuestions: [],
  advancedMode: false,
  wheelCustomization: {},
  customPointer: {},
  wheelCenter: {},
  gamePosition: 'center',
  monetization: { selectedPlan: '', leadCapture: false, analytics: false },
  extensions: [],
  segmentOverlays: { enabled: false, overlays: [] },
  setCampaignName: (name) => set({ campaignName: name }),
  reset: () => set({ campaignName: DEFAULT_NAME, selectedGameType: 'wheel', segmentCount: 6 }),
  setSelectedGameType: (t) => set({ selectedGameType: t }),
  setSegmentCount: (n) => set({ segmentCount: Math.max(1, Math.floor(n)) }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setLaunchDate: (date) => set({ launchDate: date }),
  setBackgroundImage: (file) => set({ backgroundImage: file }),
  setBackgroundImageUrl: (url) => set({ backgroundImageUrl: url }),
  setCustomColors: (colors) => set({ customColors: colors }),
  setJackpotColors: (colors) => set({ jackpotColors: colors }),
  setQuizQuestions: (questions) => set({ quizQuestions: questions }),
  setAdvancedMode: (enabled) => set({ advancedMode: enabled }),
  setWheelCustomization: (customization) => set({ wheelCustomization: customization }),
  setCustomPointer: (pointer) => set({ customPointer: pointer }),
  setWheelCenter: (center) => set({ wheelCenter: center }),
  setGamePosition: (position) => set({ gamePosition: position }),
  setPricingPlan: (plan) => set((state) => ({ monetization: { ...state.monetization, selectedPlan: plan } })),
  setLeadCapture: (enabled) => set((state) => ({ monetization: { ...state.monetization, leadCapture: enabled } })),
  setAnalytics: (enabled) => set((state) => ({ monetization: { ...state.monetization, analytics: enabled } })),
  toggleExtension: (extensionId) => set((state) => ({
    extensions: state.extensions.map((ext: any) =>
      ext.id === extensionId ? { ...ext, enabled: !ext.enabled } : ext
    )
  })),
  setSegmentOverlays: (overlays) => set({ segmentOverlays: overlays }),
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

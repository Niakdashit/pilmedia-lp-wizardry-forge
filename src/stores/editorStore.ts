import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import type { OptimizedCampaign } from '../components/ModernEditor/types/CampaignTypes';
interface ClipboardData {
  type: string; // e.g. 'element', 'style', etc.
  payload: any;
}

interface CampaignCache {
  campaign: OptimizedCampaign | null;
  canvasElements?: any[];
  modularPage?: any;
  screenBackgrounds?: any;
  extractedColors?: any[];
  canvasZoom?: number;
  lastAccessed: number;
}

interface EditorState {
  // Core state
  campaign: OptimizedCampaign | null;
  selectedCampaignId: string | null;
  activeTab: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  
  // Global new-campaign guard to prevent auto-injection across editors
  isNewCampaignGlobal: boolean;
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  isModified: boolean;
  
  // Selection state
  selectedElementId: string | null;
  showGridLines: boolean;
  showAddMenu: boolean;
  
  // Drag state
  dragState: {
    isDragging: boolean;
    draggedElementId: string | null;
    draggedElementType: string | null;
    startPosition: { x: number; y: number };
    currentOffset: { x: number; y: number };
  };
  
  // Performance optimizations
  batchedUpdates: Array<Partial<OptimizedCampaign> | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)>;
  updateCounter: number;
  lastUpdateTime: number;

  // Global clipboard state
  clipboard: ClipboardData | null;
  
  // Campaign isolation cache (per campaign ID)
  campaignDataCache: {
    [campaignId: string]: CampaignCache;
  };
  
  // Editor-specific states (namespaced by editor type)
  editorStates: {
    [editorType: string]: {
      activeTab: string;
      showQuizPanel: boolean;
      showJackpotPanel: boolean;
      showDesignPanel: boolean;
      showEffectsPanel: boolean;
      showAnimationsPanel: boolean;
      showPositionPanel: boolean;
    };
  };
}

interface EditorActions {
  // Clipboard actions
  setClipboard: (clipboard: ClipboardData) => void;
  clearClipboard: () => void;
  canPaste: () => boolean;

  // Campaign actions
  setCampaign: (updater: OptimizedCampaign | null | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)) => void;
  updateCampaignField: (field: keyof OptimizedCampaign, value: OptimizedCampaign[keyof OptimizedCampaign]) => void;
  updateDesign: (designUpdates: Partial<OptimizedCampaign['design']>) => void;
  updateGameConfig: (gameConfigUpdates: Partial<OptimizedCampaign['gameConfig']>) => void;
  
  // UI actions
  setActiveTab: (tab: string) => void;
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsModified: (modified: boolean) => void;
  
  // Selection actions
  setSelectedElementId: (id: string | null) => void;
  handleElementSelect: (elementId: string) => void;
  handleDeselectAll: () => void;
  setShowGridLines: (show: boolean) => void;
  setShowAddMenu: (show: boolean) => void;
  
  // Drag actions
  updateDragState: (newState: Partial<EditorState['dragState']>) => void;
  resetDragState: () => void;
  
  // Batch actions for performance
  batchUpdate: (updates: Array<Partial<OptimizedCampaign> | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)>) => void;
  flushBatchedUpdates: () => void;
  
  // Editor-specific state actions
  setEditorActiveTab: (editorType: string, tab: string) => void;
  setEditorPanelState: (editorType: string, panel: string, show: boolean) => void;
  getEditorState: (editorType: string) => EditorState['editorStates'][string];
  resetEditorState: (editorType: string) => void;
  
  // Reset campaign (for editor navigation)
  resetCampaign: () => void;
  
  // Initialize a fresh new campaign
  initializeNewCampaign: (type: string) => void;
  
  // Initialize a fresh new campaign with a specific ID
  initializeNewCampaignWithId: (type: string, campaignId: string) => void;
  
  // Select a campaign for an editor
  selectCampaign: (campaignId: string, editorType?: string) => void;

  // Global begin/clear new-campaign session
  beginNewCampaign: (type: string) => void;
  clearNewCampaignFlag: () => void;
  
  // Campaign cache management for isolation
  saveToCampaignCache: (campaignId: string, data: Omit<CampaignCache, 'lastAccessed'>) => void;
  loadFromCampaignCache: (campaignId: string) => CampaignCache | null;
  clearCampaignCache: (campaignId: string) => void;
  cleanupOldCaches: () => void;
}

type EditorStore = EditorState & EditorActions;

const initialDragState = {
  isDragging: false,
  draggedElementId: null,
  draggedElementType: null,
  startPosition: { x: 0, y: 0 },
  currentOffset: { x: 0, y: 0 }
};

export const useEditorStore = create<EditorStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
    // Initial state
    campaign: null,
    selectedCampaignId: null,
    activeTab: 'general',
    previewDevice: 'desktop',
    isNewCampaignGlobal: false,
    isLoading: false,
    isSaving: false,
    isModified: false,
    selectedElementId: null,
    showGridLines: false,
    showAddMenu: false,
    dragState: initialDragState,
    batchedUpdates: [],
    updateCounter: 0,
    lastUpdateTime: Date.now(),

    // Clipboard state
    clipboard: null,
    
    // Campaign isolation cache
    campaignDataCache: {},
    
    // Editor-specific states
    editorStates: {},

    // Campaign actions with batching
    setCampaign: (updater) => {
      const state = get();
      const newCampaign = typeof updater === 'function' ? updater(state.campaign) : updater;
      
      if (newCampaign) {
        // Deep clone to ensure complete isolation between campaigns
        const clonedCampaign = JSON.parse(JSON.stringify({
          ...newCampaign,
          _lastUpdate: Date.now(),
          _version: (state.campaign?._version || 0) + 1
        }));
        
        set({
          campaign: clonedCampaign,
          isModified: true,
          updateCounter: state.updateCounter + 1,
          lastUpdateTime: Date.now()
        });
      } else {
        // If setting to null, fully reset
        set({
          campaign: null,
          isModified: false,
          selectedElementId: null,
          updateCounter: 0,
          lastUpdateTime: Date.now()
        });
      }
    },

    updateCampaignField: (field, value) => {
      get().setCampaign((prev) => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    },

    updateDesign: (designUpdates) => {
      get().setCampaign((prev) => prev ? ({
        ...prev,
        design: {
          ...prev.design,
          ...designUpdates
        }
      }) : null);
    },

    updateGameConfig: (gameConfigUpdates) => {
      get().setCampaign((prev) => prev ? ({
        ...prev,
        gameConfig: {
          ...prev.gameConfig,
          ...gameConfigUpdates
        }
      }) : null);
    },

    // UI actions
    setActiveTab: (tab) => set({ activeTab: tab }),
    setPreviewDevice: (device) => set({ previewDevice: device }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsSaving: (saving) => set({ isSaving: saving }),
    setIsModified: (modified) => set({ isModified: modified }),

    // Selection actions
    setSelectedElementId: (id) => set({ selectedElementId: id }),
    
    handleElementSelect: (elementId) => {
      const state = get();
      set({ selectedElementId: state.selectedElementId === elementId ? null : elementId });
    },
    
    handleDeselectAll: () => set({ selectedElementId: null, showAddMenu: false }),
    setShowGridLines: (show) => set({ showGridLines: show }),
    setShowAddMenu: (show) => set({ showAddMenu: show }),

    // Drag actions
    updateDragState: (newState) => {
      const state = get();
      set({
        dragState: { ...state.dragState, ...newState }
      });
    },

    resetDragState: () => set({ dragState: initialDragState }),

    // Batch actions for performance
    batchUpdate: (updates) => {
      const state = get();
      set({
        batchedUpdates: [...state.batchedUpdates, ...updates]
      });
    },

    flushBatchedUpdates: () => {
      const state = get();
      if (state.batchedUpdates.length === 0) return;
      // Apply all batched updates at once
      const finalCampaign = state.batchedUpdates.reduce((acc, update) => {
        if (!acc) return null;
        return typeof update === 'function' ? update(acc) : { ...acc, ...update };
      }, state.campaign);
      set({
        campaign: finalCampaign,
        batchedUpdates: [],
        lastUpdateTime: Date.now()
      });
    },

    // Clipboard actions
    setClipboard: (clipboard) => set({ clipboard }),
    clearClipboard: () => set({ clipboard: null }),
    canPaste: () => !!get().clipboard,
    
    // Editor-specific state actions
    setEditorActiveTab: (editorType, tab) => {
      set((state) => ({
        editorStates: {
          ...state.editorStates,
          [editorType]: {
            ...state.editorStates[editorType],
            activeTab: tab
          }
        }
      }));
    },
    
    setEditorPanelState: (editorType, panel, show) => {
      set((state) => ({
        editorStates: {
          ...state.editorStates,
          [editorType]: {
            ...state.editorStates[editorType],
            [panel]: show
          }
        }
      }));
    },
    
    getEditorState: (editorType) => {
      const state = get();
      return state.editorStates[editorType] || {
        activeTab: 'elements',
        showQuizPanel: false,
        showJackpotPanel: false,
        showDesignPanel: false,
        showEffectsPanel: false,
        showAnimationsPanel: false,
        showPositionPanel: false
      };
    },
    
    resetEditorState: (editorType) => {
      set((state) => ({
        editorStates: {
          ...state.editorStates,
          [editorType]: {
            activeTab: 'elements',
            showQuizPanel: false,
            showJackpotPanel: false,
            showDesignPanel: false,
            showEffectsPanel: false,
            showAnimationsPanel: false,
            showPositionPanel: false
          }
        }
      }));
    },
    
    resetCampaign: () => {
      console.log('🔄 [EditorStore] Resetting campaign state');
      // Clear per-screen background cache across devices to avoid leaking into next editor
      try {
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1','screen2','screen3'];
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop','tablet','mobile'];
        screens.forEach((s) => devices.forEach((d) => {
          try { localStorage.removeItem(`quiz-bg-${d}-${s}`); } catch {}
          try {
            const owner = localStorage.getItem('quiz-bg-owner');
            if (owner) { localStorage.removeItem(`quiz-bg-${owner}-${d}-${s}`); }
          } catch {}
        }));
        try { localStorage.removeItem('quiz-bg-owner'); } catch {}
      } catch {}
      set({
        campaign: null,
        isModified: false,
        selectedElementId: null,
        updateCounter: 0,
        lastUpdateTime: Date.now()
      });
    },
    
    initializeNewCampaign: (type: string) => {
      console.log('🆕 [EditorStore] Initializing fresh new campaign of type:', type);
      const validType = ['wheel', 'scratch', 'jackpot', 'quiz', 'dice', 'form', 'memory', 'puzzle'].includes(type) 
        ? type as OptimizedCampaign['type']
        : 'wheel';
      
      // Clear per-screen background cache across devices so new campaign starts clean
      try {
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1','screen2','screen3'];
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop','tablet','mobile'];
        screens.forEach((s) => devices.forEach((d) => {
          try { localStorage.removeItem(`quiz-bg-${d}-${s}`); } catch {}
          try {
            const owner = localStorage.getItem('quiz-bg-owner');
            if (owner) { localStorage.removeItem(`quiz-bg-${owner}-${d}-${s}`); }
          } catch {}
        }));
        try { localStorage.removeItem('quiz-bg-owner'); } catch {}
      } catch {}

      const freshCampaign: OptimizedCampaign = {
        id: undefined,
        name: 'Nouvelle campagne',
        type: validType,
        design: {
          background: '#ffffff',
          customTexts: [],
          customImages: []
        },
        gameConfig: {},
        buttonConfig: {},
        _lastUpdate: Date.now(),
        _version: 1,
        _initialized: true
      };
      
      set({
        campaign: freshCampaign,
        isModified: false,
        selectedElementId: null,
        updateCounter: 0,
        lastUpdateTime: Date.now()
      });
    },
    
    initializeNewCampaignWithId: (type: string, campaignId: string) => {
      console.log('🆕 [EditorStore] Initializing fresh new campaign with ID:', campaignId, 'type:', type);
      const validType = ['wheel', 'scratch', 'jackpot', 'quiz', 'dice', 'form', 'memory', 'puzzle'].includes(type) 
        ? type as OptimizedCampaign['type']
        : 'wheel';
      
      // Clear per-screen background cache across devices so new campaign starts clean
      try {
        const screens: Array<'screen1' | 'screen2' | 'screen3'> = ['screen1','screen2','screen3'];
        const devices: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop','tablet','mobile'];
        screens.forEach((s) => devices.forEach((d) => {
          try { localStorage.removeItem(`quiz-bg-${d}-${s}`); } catch {}
          try {
            const owner = localStorage.getItem('quiz-bg-owner');
            if (owner) { localStorage.removeItem(`quiz-bg-${owner}-${d}-${s}`); }
          } catch {}
        }));
        try { localStorage.removeItem('quiz-bg-owner'); } catch {}
      } catch {}

      const freshCampaign: OptimizedCampaign = {
        id: campaignId,
        name: 'Nouvelle campagne',
        type: validType,
        design: {
          background: '#ffffff',
          customTexts: [],
          customImages: []
        },
        gameConfig: {},
        buttonConfig: {},
        _lastUpdate: Date.now(),
        _version: 1,
        _initialized: true
      };
      
      set({
        campaign: freshCampaign,
        selectedCampaignId: campaignId,
        isModified: false,
        selectedElementId: null,
        updateCounter: 0,
        lastUpdateTime: Date.now()
      });
    },
    
    selectCampaign: (campaignId: string, editorType?: string) => {
      console.log('🎯 [EditorStore] Selecting campaign:', campaignId, 'for editor:', editorType || 'unknown');
      set({ selectedCampaignId: campaignId });
    },

    beginNewCampaign: (type: string) => {
      console.log('🚀 [EditorStore] beginNewCampaign →', type);
      // Mark global guard to block any auto-injection across editors for this render turn
      set({ isNewCampaignGlobal: true });
      // Initialize a clean store campaign of the requested type
      get().initializeNewCampaign(type);
    },

    clearNewCampaignFlag: () => {
      if (get().isNewCampaignGlobal) {
        console.log('🔓 [EditorStore] clearNewCampaignFlag');
        set({ isNewCampaignGlobal: false });
      }
    },
    
    // Campaign cache management for complete isolation
    saveToCampaignCache: (campaignId, data) => {
      console.log('💾 [EditorStore] Saving to campaign cache:', campaignId);
      
      const cacheData: CampaignCache = {
        ...data,
        lastAccessed: Date.now()
      };
      
      // Save to in-memory cache
      set((state) => ({
        campaignDataCache: {
          ...state.campaignDataCache,
          [campaignId]: cacheData
        }
      }));
      
      // Local cache to localStorage is disabled to avoid quota issues
      // CampaignStorage.saveCampaignState(campaignId, data);
    },
    
    loadFromCampaignCache: (campaignId) => {
      console.log('📂 [EditorStore] Loading from campaign cache:', campaignId);
      
      const state = get();
      
      // Try in-memory cache first
      if (state.campaignDataCache[campaignId]) {
        console.log('✅ [EditorStore] Found in memory cache');
        return state.campaignDataCache[campaignId];
      }
      
      // Skip localStorage fallback (disabled)
      console.log('ℹ️ [EditorStore] No local cache fallback (disabled) for campaign:', campaignId);
      return null;
    },
    
    clearCampaignCache: (campaignId) => {
      console.log('🗑️ [EditorStore] Clearing campaign cache:', campaignId);
      
      // Clear from memory
      set((state) => {
        const newCache = { ...state.campaignDataCache };
        delete newCache[campaignId];
        return { campaignDataCache: newCache };
      });
      
      // LocalStorage clear disabled
    },
    
    cleanupOldCaches: () => {
      console.log('🧹 [EditorStore] Cleaning up old caches');
      
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      const state = get();
      const newCache = { ...state.campaignDataCache };
      let cleaned = 0;
      
      // Clean in-memory cache
      Object.keys(newCache).forEach(campaignId => {
        if (newCache[campaignId].lastAccessed && (now - newCache[campaignId].lastAccessed) > SEVEN_DAYS) {
          delete newCache[campaignId];
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        set({ campaignDataCache: newCache });
      }
      
      // LocalStorage cleanup disabled
      console.log(`✅ [EditorStore] Cleaned ${cleaned} old caches`);
    },
  })),
  {
    name: 'prosplay-editor-store',
    partialize: (state) => ({
      // Ne persister que le strict minimum pour éviter le dépassement de quota
      selectedCampaignId: state.selectedCampaignId,
      activeTab: state.activeTab,
      previewDevice: state.previewDevice,
    }),
  })
);

// Performance monitoring hook
export const useEditorPerformance = () => {
  const updateCounter = useEditorStore(state => state.updateCounter);
  const lastUpdateTime = useEditorStore(state => state.lastUpdateTime);
  
  return {
    updatesPerSecond: updateCounter / ((Date.now() - lastUpdateTime) / 1000 || 1),
    lastUpdateTime,
    updateCounter
  };
};
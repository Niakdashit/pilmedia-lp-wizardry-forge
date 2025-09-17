import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { OptimizedCampaign } from '../components/ModernEditor/types/CampaignTypes';

interface ClipboardData {
  type: string; // e.g. 'element', 'style', etc.
  payload: any;
}

interface EditorState {
  // Core state
  campaign: OptimizedCampaign | null;
  activeTab: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  
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
  subscribeWithSelector((set, get) => ({
    // Initial state
    campaign: null,
    activeTab: 'general',
    previewDevice: 'desktop',
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
    
    // Editor-specific states
    editorStates: {},

    // Campaign actions with batching
    setCampaign: (updater) => {
      const state = get();
      const newCampaign = typeof updater === 'function' ? updater(state.campaign) : updater;
      
      if (newCampaign) {
        set({
          campaign: {
            ...newCampaign,
            _lastUpdate: Date.now(),
            _version: (state.campaign?._version || 0) + 1
          },
          isModified: true,
          updateCounter: state.updateCounter + 1,
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
  }))
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
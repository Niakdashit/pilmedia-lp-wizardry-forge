import { create } from 'zustand';

interface EditorStore {
  campaign: any;
  setCampaign: (campaign: any) => void;
  // UI state
  previewDevice: string;
  setPreviewDevice: (device: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isModified: boolean;
  setIsModified: (modified: boolean) => void;
  // Grid and guidelines
  showGridLines: boolean;
  setShowGridLines: (show: boolean) => void;
  // Clipboard
  clipboard: any;
  setClipboard: (data: any) => void;
  canPaste: boolean;
  // Selection
  selectedElementId: string | null;
  handleElementSelect: (id: string) => void;
  handleDeselectAll: () => void;
  // Drag state
  dragState: any;
  updateDragState: (state: any) => void;
  resetDragState: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  campaign: null,
  setCampaign: (campaign: any) => set({ campaign }),
  previewDevice: 'desktop',
  setPreviewDevice: (device: string) => set({ previewDevice: device }),
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  isModified: false,
  setIsModified: (modified: boolean) => set({ isModified: modified }),
  showGridLines: false,
  setShowGridLines: (show: boolean) => set({ showGridLines: show }),
  clipboard: null,
  setClipboard: (data: any) => set({ clipboard: data, canPaste: !!data }),
  canPaste: false,
  selectedElementId: null,
  handleElementSelect: (id: string) => set({ selectedElementId: id }),
  handleDeselectAll: () => set({ selectedElementId: null }),
  dragState: null,
  updateDragState: (dragState: any) => set({ dragState }),
  resetDragState: () => set({ dragState: null }),
}));

// Performance monitoring hook - placeholder
export const useEditorPerformance = () => ({
  renderTime: 0,
  elementCount: 0,
  memoryUsage: 0,
});
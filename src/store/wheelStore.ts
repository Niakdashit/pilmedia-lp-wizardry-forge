import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BrandColors = { primary: string; secondary: string; accent?: string };

export type WheelConfigState = {
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: number;
  showBulbs?: boolean;
  theme?: string;
  size?: number;
  brandColors?: BrandColors;
};

export type WheelState = WheelConfigState & {
  campaignId?: string | number;
  segments: any[];
  lastUpdated: number; // epoch ms
};

type WheelActions = {
  setCampaignId: (campaignId?: string | number) => void;
  setSegments: (segments: any[]) => void;
  updateSegment: (id: any, patch: Partial<any>) => void;
  setConfig: (partial: Partial<WheelConfigState>) => void;
  hydrate: (partial: Partial<WheelState>) => void;
  reset: () => void;
};

export type WheelStore = WheelState & WheelActions;

const channelName = 'wheel-sync';
let bc: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  bc = new BroadcastChannel(channelName);
}

const initialState: WheelState = {
  segments: [],
  lastUpdated: 0,
  campaignId: undefined,
  borderStyle: undefined,
  borderColor: undefined,
  borderWidth: undefined,
  showBulbs: undefined,
  theme: undefined,
  size: undefined,
  brandColors: undefined,
};

function now() {
  return Date.now();
}

function segmentsEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] || {};
    const y = b[i] || {};
    if (
      x?.id !== y?.id ||
      x?.label !== y?.label ||
      x?.color !== y?.color ||
      x?.textColor !== y?.textColor ||
      x?.probability !== y?.probability ||
      x?.prizeId !== y?.prizeId ||
      x?.contentType !== y?.contentType ||
      x?.imageUrl !== y?.imageUrl ||
      x?.icon !== y?.icon
    ) {
      return false;
    }
  }
  return true;
}

function shallowConfigEqual(a: Partial<WheelConfigState>, b: Partial<WheelConfigState>) {
  if (a === b) return true;
  const keys = new Set([ ...Object.keys(a || {}), ...Object.keys(b || {}) ]);
  for (const k of keys) {
    const va = (a as any)[k];
    const vb = (b as any)[k];
    if (k === 'brandColors') {
      const ba = va || {};
      const bb = vb || {};
      if (ba.primary !== bb.primary || ba.secondary !== bb.secondary || ba.accent !== bb.accent) return false;
    } else if (va !== vb) {
      return false;
    }
  }
  return true;
}

export const useWheelStore = create<WheelStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCampaignId: (campaignId) => {
        const current = get().campaignId;
        if (current === campaignId) return;
        const ts = now();
        set({ campaignId, lastUpdated: ts });
        bc?.postMessage({ type: 'wheel:update', payload: { campaignId }, lastUpdated: ts });
      },
      setSegments: (segments) => {
        const current = get().segments;
        if (segmentsEqual(current, segments)) return;
        const ts = now();
        set({ segments, lastUpdated: ts });
        bc?.postMessage({ type: 'wheel:update', payload: { segments }, lastUpdated: ts });
      },
      updateSegment: (id, patch) => {
        const { segments } = get();
        const idx = segments.findIndex((s: any) => String(s?.id ?? '') === String(id));
        const next = [...segments];
        if (idx >= 0) next[idx] = { ...next[idx], ...patch };
        if (segmentsEqual(segments, next)) return;
        const ts = now();
        set({ segments: next, lastUpdated: ts });
        bc?.postMessage({ type: 'wheel:update', payload: { segments: next }, lastUpdated: ts });
      },
      setConfig: (partial) => {
        const current: Partial<WheelConfigState> = {
          borderStyle: get().borderStyle,
          borderColor: get().borderColor,
          borderWidth: get().borderWidth,
          showBulbs: get().showBulbs,
          theme: get().theme,
          size: get().size,
          brandColors: get().brandColors,
        };
        if (shallowConfigEqual(current, partial)) return;
        const ts = now();
        set((s) => ({ ...partial, lastUpdated: ts } as any));
        bc?.postMessage({ type: 'wheel:update', payload: partial, lastUpdated: ts });
      },
      hydrate: (partial) => {
        set((s) => ({ ...s, ...partial, lastUpdated: now() }));
      },
      reset: () => set({ ...initialState, lastUpdated: now() }),
    }),
    {
      name: 'wheel-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        campaignId: state.campaignId,
        segments: state.segments,
        borderStyle: state.borderStyle,
        borderColor: state.borderColor,
        borderWidth: state.borderWidth,
        showBulbs: state.showBulbs,
        theme: state.theme,
        size: state.size,
        brandColors: state.brandColors,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Cross-tab sync via BroadcastChannel
if (bc) {
  bc.onmessage = (ev) => {
    try {
      const { type, payload, lastUpdated } = ev.data || {};
      if (type !== 'wheel:update') return;
      const current = useWheelStore.getState();
      if (typeof lastUpdated === 'number' && lastUpdated <= current.lastUpdated) return;
      // Check if payload actually changes anything
      const next: any = { ...current, ...payload };
      const segsSame = !('segments' in (payload || {})) || segmentsEqual(current.segments, next.segments);
      const cfgSame = shallowConfigEqual(
        {
          borderStyle: current.borderStyle,
          borderColor: current.borderColor,
          borderWidth: current.borderWidth,
          showBulbs: current.showBulbs,
          theme: current.theme,
          size: current.size,
          brandColors: current.brandColors,
        },
        {
          borderStyle: next.borderStyle,
          borderColor: next.borderColor,
          borderWidth: next.borderWidth,
          showBulbs: next.showBulbs,
          theme: next.theme,
          size: next.size,
          brandColors: next.brandColors,
        }
      );
      const campaignSame = current.campaignId === next.campaignId;
      if (segsSame && cfgSame && campaignSame) return;
      useWheelStore.setState({ ...payload, lastUpdated: lastUpdated ?? now() } as any);
    } catch (e) {
      // noop
    }
  };
}

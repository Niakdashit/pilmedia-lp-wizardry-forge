import { create } from 'zustand';

export type NewsletterModule = {
  id: string;
  type: string;
  content?: string;
  settings?: Record<string, unknown>;
};

interface NewsletterState {
  modules: NewsletterModule[];
  addModule: (mod: NewsletterModule) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<NewsletterModule>) => void;
}

export const useNewsletterStore = create<NewsletterState>((set) => ({
  modules: [],
  addModule: (mod) =>
    set((state) => ({ modules: [...state.modules, mod] })),
  removeModule: (id) =>
    set((state) => ({ modules: state.modules.filter((m) => m.id !== id) })),
  updateModule: (id, updates) =>
    set((state) => ({
      modules: state.modules.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
}));

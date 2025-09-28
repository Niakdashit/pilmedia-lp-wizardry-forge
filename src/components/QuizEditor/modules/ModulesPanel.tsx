import React from 'react';
import { Image as ImgIcon, Type, Link2, SeparatorHorizontal, Video } from 'lucide-react';
import type { ModuleType, ScreenId, Module } from '@/types/modularEditor';

export interface ModulesPanelProps {
  currentScreen: ScreenId;
  onAdd: (screen: ScreenId, module: Module) => void;
}

const createModule = (type: ModuleType): Module => {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  switch (type) {
    case 'BlocTexte':
      return {
        id,
        type,
        // Default content as requested
        body: 'Nouveau texte',
        bodyFontSize: 48,
        minHeight: 220,
        accentColor: '#0ea5b7',
        cardBackground: '#e6f4f9',
        cardBorderColor: '#0ea5b7',
        cardBorderWidth: 2,
        cardRadius: 6,
        padding: 16,
        spacingTop: 16,
        spacingBottom: 16,
        align: 'center'
      };
    case 'BlocImage':
      return {
        id,
        type,
        url: '/assets/templates/placeholder.png',
        alt: 'image',
        spacingTop: 16,
        spacingBottom: 16,
        align: 'center',
        minHeight: 260,
        borderRadius: 8,
        objectFit: 'contain'
      };
    case 'BlocBouton':
      return { id, type, label: 'Call to Action', href: '#', variant: 'primary', borderRadius: 9999, spacingTop: 16, spacingBottom: 16, align: 'center', minHeight: 140 };
    case 'BlocSeparateur':
      return { id, type, thickness: 1, color: '#e5e7eb', widthPercent: 100, spacingTop: 8, spacingBottom: 8, minHeight: 80 };
    case 'BlocVideo':
      return { id, type, src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Vidéo', spacingTop: 16, spacingBottom: 16, minHeight: 320 };
  }
};

const items: Array<{ id: ModuleType; label: string; icon: React.ComponentType<any> }> = [
  { id: 'BlocTexte', label: 'Bloc Texte', icon: Type },
  { id: 'BlocImage', label: 'Bloc Image', icon: ImgIcon },
  { id: 'BlocBouton', label: 'Bloc Bouton', icon: Link2 },
  { id: 'BlocSeparateur', label: 'Séparateur', icon: SeparatorHorizontal },
  { id: 'BlocVideo', label: 'Bloc Vidéo', icon: Video }
];

const ModulesPanel: React.FC<ModulesPanelProps> = ({ currentScreen, onAdd }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--sidebar-text-primary))]">Modules</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onAdd(currentScreen, createModule(id))}
            className="flex items-center gap-2 p-3 rounded-lg border border-[hsl(var(--sidebar-border))] text-left hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
          >
            <Icon className="w-4 h-4 text-[hsl(var(--sidebar-icon))]" />
            <div>
              <div className="text-xs font-medium text-[hsl(var(--sidebar-text-primary))]">{label}</div>
              <div className="text-[10px] text-[hsl(var(--sidebar-icon))]">Ajouter à l'écran courant</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModulesPanel;

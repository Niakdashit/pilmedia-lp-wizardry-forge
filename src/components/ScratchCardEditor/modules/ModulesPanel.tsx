import React from 'react';
import { Image as ImgIcon, Type, Link2, SeparatorHorizontal, Video, Share2, Code2, Square } from 'lucide-react';
import { SOCIAL_PRESETS, getSocialIconUrl } from './socialIcons';
import type { ScreenId, Module, ModuleType, SocialIconStyle } from '@/types/modularEditor';

export interface ModulesPanelProps {
  currentScreen: ScreenId;
  onAdd: (screen: ScreenId, module: Module) => void;
}

const createModule = (type: ModuleType, screen: ScreenId): Module => {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const defaultCTA = screen === 'screen3' ? 'Rejouer' : 'Participer';
  switch (type) {
    case 'BlocTexte':
      return {
        id,
        type,
        // Default content as requested
        body: 'Nouveau texte',
        bodyFontSize: 48,
        minHeight: 220,
        layoutWidth: 'full',
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
        objectFit: 'contain',
        layoutWidth: 'full'
      };
    case 'BlocBouton':
      return {
        id,
        type,
        label: 'Call to Action',
        href: '#',
        variant: 'primary',
        borderRadius: 9999,
        spacingTop: 16,
        spacingBottom: 16,
        align: 'center',
        minHeight: 140,
        layoutWidth: 'full'
      };
    case 'BlocSeparateur':
      return { id, type, spacingTop: 8, spacingBottom: 8, minHeight: 80, layoutWidth: 'full' };
    case 'BlocVideo':
      return {
        id,
        type,
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Vidéo',
        spacingTop: 16,
        spacingBottom: 16,
        minHeight: 320,
      };
    case 'BlocReseauxSociaux': {
      const networks = ['facebook', 'linkedin', 'x', 'instagram'] as const;
      return {
        id,
        type,
        title: undefined,
        description: undefined,
        spacingTop: 12,
        spacingBottom: 12,
        layout: 'list',
        displayMode: 'icons',
        iconSize: 48,
        iconSpacing: 12,
        iconStyle: 'squareNeutral' as SocialIconStyle,
        layoutWidth: 'full',
        minHeight: 120,
        links: networks.map((network) => {
          const preset = SOCIAL_PRESETS[network];
          return {
            id: `${id}-${network}`,
            label: preset.label,
            url: preset.defaultUrl,
            network,
            icon: network,
            iconUrl: getSocialIconUrl(network),
          };
        })
      };
    }
    case 'BlocHtml':
      return {
        id,
        type: 'BlocHtml' as const,
        html: '<div style="text-align:center; padding:16px;">\n  <h3>Bloc HTML</h3>\n  <p>Ajoutez votre code HTML personnalisé ici.</p>\n</div>',
        spacingTop: 16,
        spacingBottom: 16,
        layoutWidth: 'full',
        minHeight: 200,
        backgroundColor: '#f8fafc'
      };
    case 'BlocCarte':
      return {
        id,
        type: 'BlocCarte' as const,
        title: 'Merci pour votre participation',
        description: 'Ajouter des lignes dans le corps du texte',
        cardBackground: '#ffffff',
        cardBorderColor: '#e5e7eb',
        cardBorderWidth: 1,
        cardRadius: 12,
        padding: 24,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: 600,
        spacingTop: 16,
        spacingBottom: 16,
        align: 'center',
        children: [
          {
            id: `${id}-text-1`,
            type: 'BlocTexte',
            body: 'Texte par défaut',
            bodyFontSize: 16,
            align: 'center'
          },
          {
            id: `${id}-btn-1`,
            type: 'BlocBouton',
            label: defaultCTA,
            href: '#',
            background: '#000000',
            textColor: '#ffffff',
            borderRadius: 9999,
            align: 'center'
          }
        ]
      };
  }
};

const items: Array<{ id: ModuleType; label: string; icon: React.ComponentType<any> }> = [
  { id: 'BlocTexte', label: 'Bloc Texte', icon: Type },
  { id: 'BlocImage', label: 'Bloc Image', icon: ImgIcon },
  { id: 'BlocBouton', label: 'Bloc Bouton', icon: Link2 },
  { id: 'BlocCarte', label: 'Carte', icon: Square },
  { id: 'BlocSeparateur', label: 'Espace', icon: SeparatorHorizontal },
  { id: 'BlocVideo', label: 'Bloc Vidéo', icon: Video },
  { id: 'BlocReseauxSociaux', label: 'Réseaux sociaux', icon: Share2 },
  { id: 'BlocHtml', label: 'Bloc HTML', icon: Code2 }
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
            onClick={() => onAdd(currentScreen, createModule(id, currentScreen))}
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

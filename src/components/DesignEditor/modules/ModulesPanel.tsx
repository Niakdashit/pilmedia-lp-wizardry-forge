import React from 'react';
import { Image as ImgIcon, Type, Link2, SeparatorHorizontal, Video, Share2, Code2, Square, Footprints } from 'lucide-react';
import { SOCIAL_PRESETS, getSocialIconUrl } from './socialIcons';
import type { ScreenId, Module, ModuleType, SocialIconStyle } from '@/types/modularEditor';

export interface ModulesPanelProps {
  currentScreen: ScreenId;
  onAdd: (screen: ScreenId, module: Module) => void;
  existingModules?: Module[];
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
    case 'BlocLogo':
      return {
        id,
        type: 'BlocLogo' as const,
        logoUrl: '',
        logoWidth: 120,
        logoHeight: 120,
        bandHeight: 60,
        bandColor: '#ffffff',
        bandPadding: 16,
        align: 'center',
        spacingTop: 0,
        spacingBottom: 0,
        layoutWidth: 'full',
        minHeight: 120
      };
    case 'BlocPiedDePage':
      return {
        id,
        type: 'BlocPiedDePage' as const,
        logoUrl: '',
        logoWidth: 120,
        logoHeight: 120,
        bandHeight: 60,
        bandColor: '#ffffff',
        bandPadding: 16,
        align: 'center',
        spacingTop: 0,
        spacingBottom: 0,
        layoutWidth: 'full',
        minHeight: 120
      };
  }
};

const items: Array<{ id: ModuleType; label: string; icon: React.ComponentType<any> }> = [
  { id: 'BlocTexte', label: 'Bloc Texte', icon: Type },
  { id: 'BlocImage', label: 'Bloc Image', icon: ImgIcon },
  { id: 'BlocBouton', label: 'Bloc Bouton', icon: Link2 },
  { id: 'BlocCarte', label: 'Carte', icon: Square },
  { id: 'BlocLogo', label: 'Logo', icon: ImgIcon },
  { id: 'BlocPiedDePage', label: 'Pied de page', icon: Footprints },
  { id: 'BlocVideo', label: 'Bloc Vidéo', icon: Video },
  { id: 'BlocReseauxSociaux', label: 'Réseaux sociaux', icon: Share2 },
  { id: 'BlocHtml', label: 'Bloc HTML', icon: Code2 }
];

const ModulesPanel: React.FC<ModulesPanelProps> = ({ currentScreen, onAdd, existingModules = [] }) => {
  // Vérifier si un module Logo ou Pied de page existe déjà
  const hasLogo = existingModules.some(m => m.type === 'BlocLogo');
  const hasFooter = existingModules.some(m => m.type === 'BlocPiedDePage');

  const handleAddModule = (moduleType: ModuleType) => {
    // Empêcher l'ajout si le module existe déjà
    if (moduleType === 'BlocLogo' && hasLogo) return;
    if (moduleType === 'BlocPiedDePage' && hasFooter) return;

    // Pour Logo et Pied de page, ajouter à tous les écrans
    if (moduleType === 'BlocLogo' || moduleType === 'BlocPiedDePage') {
      const screens: ScreenId[] = ['screen1', 'screen2', 'screen3'];
      screens.forEach(screen => {
        onAdd(screen, createModule(moduleType, screen));
      });
    } else {
      // Pour les autres modules, ajouter seulement à l'écran courant
      onAdd(currentScreen, createModule(moduleType, currentScreen));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[hsl(var(--sidebar-text-primary))]">Modules</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ id, label, icon: Icon }) => {
          const isGlobalModule = id === 'BlocLogo' || id === 'BlocPiedDePage';
          const isDisabled = (id === 'BlocLogo' && hasLogo) || (id === 'BlocPiedDePage' && hasFooter);
          
          return (
            <button
              key={id}
              onClick={() => handleAddModule(id)}
              disabled={isDisabled}
              className={`flex items-center gap-2 p-3 rounded-lg border border-[hsl(var(--sidebar-border))] text-left transition-colors ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                  : 'hover:bg-[hsl(var(--sidebar-hover))]'
              }`}
            >
              <Icon className="w-4 h-4 text-[hsl(var(--sidebar-icon))]" />
              <div>
                <div className="text-xs font-medium text-[hsl(var(--sidebar-text-primary))]">{label}</div>
                <div className="text-[10px] text-[hsl(var(--sidebar-icon))]">
                  {isDisabled 
                    ? 'Déjà ajouté' 
                    : isGlobalModule 
                      ? 'Ajouter à tous les écrans' 
                      : 'Ajouter à l\'\u00e9cran courant'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModulesPanel;

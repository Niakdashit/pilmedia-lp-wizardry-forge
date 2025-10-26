import React, { useState, useEffect } from 'react';
import { Type, Shapes, Search, Image as ImgIcon, Link2, SeparatorHorizontal, Video, Share2, Code2, Square, Footprints, Layout } from 'lucide-react';
import TextPanel from './TextPanel';
import { shapes, ShapeDefinition } from '../shapes/shapeLibrary';
import type { ModuleType, Module, ScreenId } from '@/types/modularEditor';
import { SOCIAL_PRESETS, getSocialIconUrl } from '@/components/QuizEditor/modules/socialIcons';

interface AssetsPanelProps {
  onAddElement: (element: any) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  elements?: any[];
  onAddModule?: (module: any) => void;
  currentScreen?: ScreenId;
}

const AssetsPanel: React.FC<AssetsPanelProps> = ({ onAddElement, selectedElement, onElementUpdate, selectedDevice = 'desktop', elements = [], onAddModule, currentScreen = 'screen1' }) => {
  // Preview color for shapes in the sub-tab "Formes"
  const SHAPE_PREVIEW_COLOR = '#b1b1b1';
  // Visually disable the "Formes" sub-tab
  const SHAPES_TAB_DISABLED = true;
  const [activeTab, setActiveTab] = useState('modules');
  const [searchQuery, setSearchQuery] = useState('');
  // uploads removed

  const categories = [
    { id: 'modules', label: 'Modules', icon: Layout },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'shapes', label: 'Formes', icon: Shapes }
  ];

  // If shapes are disabled and currently active, fallback to text
  useEffect(() => {
    if (SHAPES_TAB_DISABLED && activeTab === 'shapes') {
      setActiveTab('text');
    }
  }, [activeTab]);

  const handleAddShape = (shape: ShapeDefinition) => {
    const element = {
      id: `shape-${Date.now()}-${shape.id}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      rotation: 0,
      zIndex: 1,
      backgroundColor: shape.color,
      style: {
        backgroundColor: shape.color,
      },
      shapeType: shape.type, // Assurez-vous que c'est bien défini
      // Propriétés spécifiques pour certaines formes
      ...(shape.aspectRatio && { aspectRatio: shape.aspectRatio }),
      ...(shape.borderRadius && { borderRadius: shape.borderRadius }),
      metadata: {
        originalType: shape.type,
        icon: shape.icon?.name || 'square'
      }
    };
    onAddElement(element);
  };

  const createModule = (type: ModuleType, screen: ScreenId): Module => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const defaultCTA = screen === 'screen3' ? 'Rejouer' : 'Participer';
    switch (type) {
      case 'BlocTexte':
        return {
          id,
          type,
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
          url: '/assets/templates/placeholder.svg',
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
          iconStyle: 'squareNeutral' as any,
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

  const moduleItems: Array<{ id: ModuleType; label: string; icon: React.ComponentType<any> }> = [
    { id: 'BlocTexte', label: 'Bloc Texte', icon: Type },
    { id: 'BlocImage', label: 'Bloc Image', icon: ImgIcon },
    { id: 'BlocBouton', label: 'Bloc Bouton', icon: Link2 },
    { id: 'BlocCarte', label: 'Carte', icon: Square },
    { id: 'BlocLogo', label: 'Logo', icon: ImgIcon },
    { id: 'BlocPiedDePage', label: 'Pied de page', icon: Footprints },
    { id: 'BlocSeparateur', label: 'Espace', icon: SeparatorHorizontal },
    { id: 'BlocVideo', label: 'Bloc Vidéo', icon: Video },
    { id: 'BlocReseauxSociaux', label: 'Réseaux sociaux', icon: Share2 },
    { id: 'BlocHtml', label: 'Bloc HTML', icon: Code2 }
  ];

  // uploads handlers removed

  const renderContent = () => {
    switch (activeTab) {
      case 'modules':
        return (
          <div className="grid grid-cols-2 gap-2">
            {moduleItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  const module = createModule(id, currentScreen);
                  if (onAddModule) {
                    onAddModule(module);
                  }
                }}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 text-left hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900">{label}</div>
                  <div className="text-[10px] text-gray-500">Ajouter à l'écran courant</div>
                </div>
              </button>
            ))}
          </div>
        );

      case 'text':
        return <TextPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} elements={elements} />;

      case 'shapes':
        // Filtrer toutes les formes selon la recherche
        let shapesToShow = shapes;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          shapesToShow = shapes.filter((shape: ShapeDefinition) => 
            shape.label.toLowerCase().includes(query) || 
            shape.type.toLowerCase().includes(query)
          );
        }

        return (
          <div>
            {/* Grille de formes sans cadres */}
            <div className="grid grid-cols-3 gap-4">
              {shapesToShow.map((shape: ShapeDefinition) => {
                return (
                  <button
                    key={shape.id}
                    onClick={() => handleAddShape(shape)}
                    className="aspect-square p-2 hover:bg-gray-100 hover:bg-opacity-20 transition-colors flex items-center justify-center"
                    title={shape.label}
                  >
                    {shape.viewBox && shape.paths ? (
                      <svg
                        viewBox={shape.viewBox}
                        className="w-full h-full"
                        fill="none"
                      >
                        {shape.paths.map((path: any, index: number) => (
                          <path
                            key={index}
                            d={path.d}
                            fill={SHAPE_PREVIEW_COLOR}
                            stroke="none"
                            {...(path.fillRule && { fillRule: path.fillRule })}
                            {...(path.clipRule && { clipRule: path.clipRule })}
                            {...(path.opacity && { opacity: path.opacity })}
                          />
                        ))}
                      </svg>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: SHAPE_PREVIEW_COLOR }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // uploads tab removed

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      {(() => {
        const visibleCategories = categories.filter((c) => !(SHAPES_TAB_DISABLED && c.id === 'shapes'));
        return (
          <div className="flex border-b border-gray-200 mb-4">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              const isShapes = category.id === 'shapes';
              const isDisabled = isShapes && SHAPES_TAB_DISABLED;
              const handleClick = () => {
                if (isDisabled) return; // Prevent activating disabled tab
                setActiveTab(category.id);
              };
              return (
                <button
                  key={category.id}
                  onClick={handleClick}
                  disabled={isDisabled}
                  aria-disabled={isDisabled}
                  className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                    isDisabled
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : activeTab === category.id
                        ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={isDisabled ? 'Désactivé' : category.label}
                >
                  <Icon className={`w-4 h-4 ${isDisabled ? 'opacity-60' : ''}`} />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Search - Seulement affiché pour les formes */}
      {activeTab === 'shapes' && !SHAPES_TAB_DISABLED && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une forme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
        </div>
      )}

      {/* Content */}
      {/* Prevent rendering of disabled tab content */}
      {activeTab === 'shapes' && SHAPES_TAB_DISABLED ? null : renderContent()}
    </div>
  );
};

export default AssetsPanel;
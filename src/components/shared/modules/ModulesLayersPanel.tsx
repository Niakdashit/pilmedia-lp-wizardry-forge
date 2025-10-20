import React from 'react';
import { 
  Eye, 
  EyeOff, 
  Trash2,
  Type,
  Image as ImageIcon,
  Square,
  Video,
  Link,
  Code,
  CreditCard,
  Building2,
  Footprints,
  Space
} from 'lucide-react';
import type { Module } from './ModulesPanel';

interface ModulesLayersPanelProps {
  modules: Module[];
  selectedModuleId?: string | null;
  onModuleSelect?: (moduleId: string) => void;
  onModuleDelete?: (moduleId: string) => void;
  onModuleToggleVisibility?: (moduleId: string) => void;
}

const ModulesLayersPanel: React.FC<ModulesLayersPanelProps> = ({
  modules,
  selectedModuleId,
  onModuleSelect,
  onModuleDelete,
  onModuleToggleVisibility
}) => {
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'BlocTexte':
        return Type;
      case 'BlocImage':
        return ImageIcon;
      case 'BlocBouton':
        return Square;
      case 'BlocVideo':
        return Video;
      case 'BlocReseauxSociaux':
        return Link;
      case 'BlocHtml':
        return Code;
      case 'BlocCarte':
        return CreditCard;
      case 'BlocLogo':
        return Building2;
      case 'BlocPiedDePage':
        return Footprints;
      case 'BlocSeparateur':
        return Space;
      default:
        // Gérer BlocEspace et autres types non typés
        if (type === 'BlocEspace') return Space;
        return Square;
    }
  };

  const getModuleLabel = (module: Module) => {
    const mod = module as any;
    
    switch (module.type) {
      case 'BlocTexte':
        // Afficher le début du texte (max 40 caractères)
        const text = mod.text || '';
        const cleanText = text.replace(/<[^>]*>/g, '').trim(); // Supprimer HTML
        return cleanText.length > 40 ? cleanText.substring(0, 40) + '...' : cleanText || 'Texte vide';
      
      case 'BlocImage':
        // Afficher le nom du fichier
        const imageUrl = mod.imageUrl || mod.url || '';
        const fileName = imageUrl.split('/').pop()?.split('?')[0] || 'Image';
        return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
      
      case 'BlocBouton':
        // Afficher le texte du bouton
        const buttonText = mod.text || mod.label || '';
        return buttonText.length > 30 ? buttonText.substring(0, 30) + '...' : buttonText || 'Bouton';
      
      case 'BlocVideo':
        // Afficher l'URL de la vidéo (tronquée)
        const videoUrl = mod.videoUrl || mod.url || '';
        if (videoUrl) {
          const shortUrl = videoUrl.length > 35 ? videoUrl.substring(0, 35) + '...' : videoUrl;
          return shortUrl;
        }
        return 'Vidéo';
      
      case 'BlocReseauxSociaux':
        // Afficher le nombre de liens
        const linksCount = mod.links?.length || 0;
        return `Réseaux sociaux (${linksCount})`;
      
      case 'BlocHtml':
        // Afficher le début du code HTML
        const html = mod.html || mod.content || '';
        const cleanHtml = html.replace(/<[^>]*>/g, '').trim();
        return cleanHtml.length > 35 ? cleanHtml.substring(0, 35) + '...' : cleanHtml || 'HTML';
      
      case 'BlocCarte':
        // Afficher le titre de la carte
        const carteTitle = mod.title || '';
        return carteTitle.length > 30 ? carteTitle.substring(0, 30) + '...' : carteTitle || 'Carte';
      
      case 'BlocLogo':
        return 'Logo';
      
      case 'BlocPiedDePage':
        return 'Pied de page';
      
      case 'BlocSeparateur':
        // Afficher la hauteur de l'espace
        const height = mod.height || mod.minHeight || 40;
        return `Espace (${height}px)`;
      
      default:
        // Gérer BlocEspace et autres types non typés
        if (mod.type === 'BlocEspace') {
          const spaceHeight = mod.height || mod.minHeight || 40;
          return `Espace (${spaceHeight}px)`;
        }
        return 'Module';
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-4">
        Aucun module sur cet écran
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {modules.map((module) => {
        const Icon = getModuleIcon(module.type);
        const isSelected = selectedModuleId === module.id;
        const isVisible = (module as any).visible !== false;
        const isImage = module.type === 'BlocImage';
        const imageUrl = isImage ? ((module as any).imageUrl || (module as any).url) : null;

        return (
          <div
            key={module.id}
            className={`
              group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
              ${isSelected 
                ? 'bg-[hsl(var(--sidebar-active-bg))] border border-[hsl(var(--sidebar-active))]' 
                : 'hover:bg-[hsl(var(--sidebar-hover))] border border-transparent'
              }
            `}
            onClick={() => onModuleSelect?.(module.id)}
          >
            {/* Icône du type de module OU miniature pour les images */}
            {isImage && imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Miniature"
                className="w-8 h-8 object-cover rounded border border-gray-300 flex-shrink-0"
                onError={(e) => {
                  // Si l'image ne charge pas, afficher l'icône par défaut
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Icon 
                className={`w-4 h-4 flex-shrink-0 ${
                  isSelected 
                    ? 'text-[hsl(var(--sidebar-icon-active))]' 
                    : 'text-[hsl(var(--sidebar-icon))]'
                }`} 
              />
            )}

            {/* Nom du module */}
            <span 
              className={`flex-1 text-sm truncate ${
                isSelected 
                  ? 'text-[hsl(var(--sidebar-text-primary))] font-medium' 
                  : 'text-[hsl(var(--sidebar-text-secondary))]'
              }`}
            >
              {getModuleLabel(module)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Toggle visibilité */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleToggleVisibility?.(module.id);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={isVisible ? 'Masquer' : 'Afficher'}
              >
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {/* Supprimer */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleDelete?.(module.id);
                }}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModulesLayersPanel;

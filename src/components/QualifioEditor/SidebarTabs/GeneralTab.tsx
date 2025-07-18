import React from 'react';
import { Target, HelpCircle, Cookie, Dice6, Brain, Puzzle, FileText, Upload } from 'lucide-react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';
import type { EditorConfig } from '../QualifioEditorLayout';
import { generateBrandThemeFromFile } from '../../../utils/BrandStyleAnalyzer';
interface GeneralTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const GeneralTab: React.FC<GeneralTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const handleBannerUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async e => {
      const imageUrl = e.target?.result as string;
      try {
        // Extract colors from banner image
        const brandTheme = await generateBrandThemeFromFile(file);
        onConfigUpdate({
          bannerImage: imageUrl,
          brandAssets: {
            ...config.brandAssets,
            primaryColor: brandTheme.customColors.primary,
            secondaryColor: brandTheme.customColors.secondary,
            accentColor: brandTheme.customColors.accent
          }
        });
      } catch (error) {
        console.error('Error extracting colors from banner image:', error);
        // Fallback: just update the image without color extraction
        onConfigUpdate({
          bannerImage: imageUrl
        });
      }
    };
    reader.readAsDataURL(file);
  };
  const gameTypes = [{
    value: 'wheel',
    label: 'Roue de la fortune',
    icon: Target
  }, {
    value: 'quiz',
    label: 'Quiz',
    icon: HelpCircle
  }, {
    value: 'scratch',
    label: 'Carte à gratter',
    icon: Cookie
  }, {
    value: 'jackpot',
    label: 'Machine à sous',
    icon: Target
  }, {
    value: 'dice',
    label: 'Dés',
    icon: Dice6
  }, {
    value: 'memory',
    label: 'Memory',
    icon: Brain
  }, {
    value: 'puzzle',
    label: 'Puzzle',
    icon: Puzzle
  }, {
    value: 'form',
    label: 'Formulaire',
    icon: FileText
  }];
  return <div className="space-y-6">
      <h3 className="section-title">Configuration générale</h3>
      
      {/* Game Type Selection */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Mécanique de jeu</h4>
        
        <div className="form-group-premium">
          <label>Type de jeu</label>
          <select value={config.gameType} onChange={e => onConfigUpdate({
          gameType: e.target.value as EditorConfig['gameType']
        })}>
            {gameTypes.map(gameType => <option key={gameType.value} value={gameType.value}>
                {gameType.label}
              </option>)}
          </select>
        </div>
      </div>
      
      {/* Game Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Paramètres du jeu</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Mode de jeu</label>
            <select value={config.gameMode} onChange={e => onConfigUpdate({
            gameMode: e.target.value as EditorConfig['gameMode']
          })}>
              <option value="mode1-sequential">Mode 1 - Séquentiel (Descriptif + Zone de jeu)</option>
            </select>
          </div>

          <div className="form-group-premium">
            <label>Mode d'affichage</label>
            <select value={config.displayMode} onChange={e => onConfigUpdate({
            displayMode: e.target.value as EditorConfig['displayMode']
          })}>
              <option value="mode1-banner-game">Mode 1 - Bannière + zone de texte</option>
              <option value="mode2-background">Mode 2 - Fond seul (paysage)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Dimensions</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group-premium">
            <label>Largeur (px)</label>
            <input type="number" value={config.width} onChange={e => onConfigUpdate({
            width: parseInt(e.target.value) || 810
          })} placeholder="810" />
          </div>

          <div className="form-group-premium">
            <label>Hauteur (px)</label>
            <input type="number" value={config.height} onChange={e => onConfigUpdate({
            height: parseInt(e.target.value) || 1200
          })} placeholder="1200" />
          </div>
        </div>

        <div className="form-group-premium">
          <label>Position d'ancrage</label>
          <select value={config.anchor} onChange={e => onConfigUpdate({
          anchor: e.target.value as 'fixed' | 'center'
        })}>
            <option value="fixed">Position fixe</option>
            <option value="center">Centré</option>
          </select>
        </div>
      </div>

      {/* Banner Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Bannière</h4>
        
        <div className="space-y-4">
          <div className="w-full h-40 bg-sidebar-surface rounded-xl flex items-center justify-center border-2 border-dashed border-sidebar-border overflow-hidden relative">
            {config.bannerImage ? <>
                <img src={config.bannerImage} alt="Banner" className="max-w-full max-h-full object-contain" />
                <button onClick={() => onConfigUpdate({
              bannerImage: undefined
            })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                  ×
                </button>
              </> : <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                handleBannerUpload(file);
              }
            }} className="hidden" />
                <Upload className="w-8 h-8 text-sidebar-text mx-auto mb-2" />
                <span className="text-sidebar-text text-sm">Cliquez pour ajouter une image</span>
              </label>}
          </div>
          
          <div className="form-group-premium">
            <label>Description de l'image</label>
            <textarea value={config.bannerDescription || ''} onChange={e => onConfigUpdate({
            bannerDescription: e.target.value
          })} placeholder="Décrivez votre image pour l'accessibilité..." rows={3} />
          </div>

          <div className="form-group-premium">
            <label>Lien de redirection (optionnel)</label>
            <input type="url" value={config.bannerLink || ''} onChange={e => onConfigUpdate({
            bannerLink: e.target.value
          })} placeholder="https://www.qualifio.com" />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Couleurs</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input type="color" value={config.backgroundColor || '#ffffff'} onChange={e => onConfigUpdate({
              backgroundColor: e.target.value
            })} />
              <input type="text" value={config.backgroundColor || '#ffffff'} onChange={e => onConfigUpdate({
              backgroundColor: e.target.value
            })} placeholder="#ffffff" />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur de contour</label>
            <div className="color-input-group">
              <input type="color" value={config.outlineColor || '#ffffff'} onChange={e => onConfigUpdate({
              outlineColor: e.target.value
            })} />
              <input type="text" value={config.outlineColor || '#ffffff'} onChange={e => onConfigUpdate({
              outlineColor: e.target.value
            })} placeholder="#ffffff" />
            </div>
          </div>
        </div>
      </div>

      {/* Wheel Border Style */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style de la roue</h4>
        <div className="p-4 rounded-xl bg-sidebar-bg">
          <BorderStyleSelector currentStyle={config.borderStyle || 'classic'} onStyleChange={style => onConfigUpdate({
          borderStyle: style
        })} />
        </div>
      </div>
    </div>;
};
export default GeneralTab;
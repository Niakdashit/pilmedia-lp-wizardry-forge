
import React from 'react';
import { Palette, Image, Upload, Trash2 } from 'lucide-react';
import type { EditorConfig } from '../GameEditorLayout';

interface DesignTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'banner') {
          onConfigUpdate({ bannerImage: imageUrl });
        } else {
          // Handle background image for device config
          const deviceConfig = config.deviceConfig || {
            mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
          };
          onConfigUpdate({
            deviceConfig: {
              ...deviceConfig,
              desktop: { ...deviceConfig.desktop, backgroundImage: imageUrl }
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Design & Contenu</h3>
      
      {/* Couleurs principales */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs principales
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur de contour</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
              />
              <input
                type="text"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Image className="w-4 h-4" />
          Images
        </h4>
        
        <div className="space-y-4">
          {/* Image de bannière */}
          <div className="form-group-premium">
            <label>Image de bannière</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
                {config.bannerImage && (
                  <button
                    onClick={() => onConfigUpdate({ bannerImage: undefined })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {config.bannerImage && (
                <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={config.bannerImage}
                    alt="Aperçu bannière"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description de bannière */}
          <div className="form-group-premium">
            <label>Description de bannière</label>
            <textarea
              value={config.bannerDescription || ''}
              onChange={e => onConfigUpdate({ bannerDescription: e.target.value })}
              placeholder="Description courte pour accompagner la bannière..."
              rows={3}
            />
          </div>

          {/* Lien de bannière */}
          <div className="form-group-premium">
            <label>Lien de bannière</label>
            <input
              type="url"
              value={config.bannerLink || ''}
              onChange={e => onConfigUpdate({ bannerLink: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Style de bordure */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style de bordure</h4>
        
        <div className="form-group-premium">
          <label>Type de bordure</label>
          <select
            value={config.borderStyle || 'classic'}
            onChange={e => onConfigUpdate({ borderStyle: e.target.value })}
          >
            <option value="classic">Classique</option>
            <option value="rounded">Arrondie</option>
            <option value="modern">Moderne</option>
            <option value="none">Aucune</option>
          </select>
        </div>
      </div>

      {/* Bouton de participation */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Bouton de participation</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du bouton</label>
            <input
              type="text"
              value={config.participateButtonText || 'PARTICIPER !'}
              onChange={e => onConfigUpdate({ participateButtonText: e.target.value })}
              placeholder="PARTICIPER !"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group-premium">
              <label>Couleur du bouton</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                  placeholder="#ff6b35"
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label>Couleur du texte</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Pied de page</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du pied de page</label>
            <textarea
              value={config.footerText || ''}
              onChange={e => onConfigUpdate({ footerText: e.target.value })}
              placeholder="Mentions légales, conditions..."
              rows={3}
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond du pied de page</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
              />
              <input
                type="text"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
                placeholder="#f8f9fa"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;

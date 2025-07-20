
import React from 'react';
import { Upload, Image as ImageIcon, Type, Plus, Trash2, Palette } from 'lucide-react';
import type { EditorConfig, CustomText } from '../QualifioEditorLayout';

interface DesignContentTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignContentTab: React.FC<DesignContentTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newImage = {
        id: Date.now().toString(),
        src: imageUrl,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0
      };
      onConfigUpdate({
        design: {
          ...config.design,
          customImages: [...(config.design?.customImages || []), newImage]
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageId: string) => {
    onConfigUpdate({
      design: {
        ...config.design,
        customImages: (config.design?.customImages || []).filter((img: any) => img.id !== imageId)
      }
    });
  };

  const addCustomText = () => {
    const newText: CustomText = {
      id: Date.now().toString(),
      content: 'Nouveau texte',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      width: 200,
      height: 50
    };
    
    onConfigUpdate({
      customTexts: [...(config.customTexts || []), newText]
    });
  };

  const removeCustomText = (textId: string) => {
    onConfigUpdate({
      customTexts: (config.customTexts || []).filter(text => text.id !== textId)
    });
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center">Design & Contenu</h3>
      
      {/* Background & Colors */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs et arrière-plan
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

      {/* Custom Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Images personnalisées
        </h4>
        
        <div className="space-y-4">
          <label className="w-full h-32 bg-sidebar-surface rounded-xl flex items-center justify-center border-2 border-dashed border-sidebar-border cursor-pointer hover:bg-sidebar-hover transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }} 
              className="hidden" 
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-sidebar-text mx-auto mb-2" />
              <span className="text-sidebar-text text-sm font-medium">Ajouter une image</span>
              <p className="text-sidebar-text-muted text-xs mt-1">PNG, JPG jusqu'à 10MB</p>
            </div>
          </label>

          {config.design?.customImages && config.design.customImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {config.design.customImages.map((image: any) => (
                <div key={image.id} className="relative group">
                  <div className="w-full aspect-square bg-sidebar-surface rounded-lg overflow-hidden border border-sidebar-border">
                    <img src={image.src} alt="Image personnalisée" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Texts */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Type className="w-4 h-4" />
          Textes personnalisés
        </h4>
        
        <div className="space-y-4">
          <button
            onClick={addCustomText}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-sidebar-border rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-text"
          >
            <Plus className="w-4 h-4" />
            Ajouter un texte
          </button>

          {config.customTexts && config.customTexts.length > 0 && (
            <div className="space-y-3">
              {config.customTexts.map((text) => (
                <div key={text.id} className="bg-sidebar-surface rounded-lg p-3 border border-sidebar-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sidebar-text-primary font-medium text-sm truncate">
                      {text.content || 'Texte sans contenu'}
                    </span>
                    <button
                      onClick={() => removeCustomText(text.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-sidebar-text-muted">
                    Position: {text.x}%, {text.y}% • Taille: {text.fontSize}px
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Text Areas */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Textes principaux</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte de l'histoire</label>
            <textarea
              value={config.storyText || ''}
              onChange={e => onConfigUpdate({ storyText: e.target.value })}
              rows={4}
              placeholder="Racontez votre histoire..."
            />
          </div>

          <div className="form-group-premium">
            <label>Lien éditeur</label>
            <input
              type="text"
              value={config.publisherLink || ''}
              onChange={e => onConfigUpdate({ publisherLink: e.target.value })}
              placeholder="www.exemple.com"
            />
          </div>

          <div className="form-group-premium">
            <label>Description du prix</label>
            <textarea
              value={config.prizeText || ''}
              onChange={e => onConfigUpdate({ prizeText: e.target.value })}
              rows={3}
              placeholder="Décrivez le prix à gagner..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignContentTab;

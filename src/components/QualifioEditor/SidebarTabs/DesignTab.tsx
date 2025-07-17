import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface DesignTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({ config, onConfigUpdate }) => {
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newImage = {
        id: Date.now().toString(),
        src: imageUrl, // Changé de 'url' à 'src' pour correspondre à EditableImage
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

  return (
    <div className="space-y-6">
      <h3 className="section-title">Design et éléments visuels</h3>
      
      {/* Images personnalisées */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Images personnalisées</h4>
        
        <div className="space-y-4">
          {/* Bouton d'ajout d'image */}
          <label className="w-full h-32 bg-sidebar-surface rounded-xl flex items-center justify-center border-2 border-dashed border-sidebar-border cursor-pointer hover:bg-sidebar-hover transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-sidebar-text mx-auto mb-2" />
              <span className="text-sidebar-text text-sm font-medium">Ajouter une image</span>
              <p className="text-sidebar-text-muted text-xs mt-1">PNG, JPG jusqu'à 10MB</p>
            </div>
          </label>

          {/* Liste des images uploadées */}
          {config.design?.customImages && config.design.customImages.length > 0 ? (
            <div className="space-y-3">
              <h5 className="text-sidebar-text-primary text-sm font-medium">Images ajoutées :</h5>
              <div className="grid grid-cols-2 gap-3">
                {config.design.customImages.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <div className="w-full aspect-square bg-sidebar-surface rounded-lg overflow-hidden border border-sidebar-border">
                      <img 
                        src={image.src} 
                        alt="Image personnalisée"
                        className="w-full h-full object-cover"
                      />
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
            </div>
          ) : (
            <div className="text-center py-6">
              <ImageIcon className="w-12 h-12 text-sidebar-text-muted mx-auto mb-3" />
              <p className="text-sidebar-text-muted text-sm">Aucune image ajoutée</p>
              <p className="text-sidebar-text-muted text-xs mt-1">
                Uploadez des images pour les rendre déplaçables sur votre bannière
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paramètres d'arrière-plan */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Arrière-plan</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
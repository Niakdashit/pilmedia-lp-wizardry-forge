import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';
import ImageUpload from '../../common/ImageUpload';

interface ImagesTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const ImagesTab: React.FC<ImagesTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="sidebar-content">
      <h3 className="section-title">Images</h3>
      
      {/* Banner Image */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Image de bannière</h4>
        
        <div className="space-y-4">
          <ImageUpload
            value={config.bannerImage || ''}
            onChange={(value) => onConfigUpdate({ bannerImage: value })}
            label="Image de bannière"
            accept="image/*"
          />
          
          <div className="form-group-premium">
            <label>Description de l'image (accessibilité)</label>
            <textarea
              value={config.bannerDescription || ''}
              onChange={(e) => onConfigUpdate({ bannerDescription: e.target.value })}
              placeholder="Décrivez votre image pour l'accessibilité..."
              rows={3}
            />
          </div>

          <div className="form-group-premium">
            <label>Lien de redirection (optionnel)</label>
            <input
              type="url"
              value={config.bannerLink || ''}
              onChange={(e) => onConfigUpdate({ bannerLink: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Footer Image */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Image de footer</h4>
        
        <div className="space-y-4">
          <ImageUpload
            value={config.footerImage || ''}
            onChange={(value) => onConfigUpdate({ footerImage: value })}
            label="Image de footer"
            accept="image/*"
          />
          
          <div className="form-group-premium">
            <label>Description de l'image footer</label>
            <textarea
              value={config.footerImageDescription || ''}
              onChange={(e) => onConfigUpdate({ footerImageDescription: e.target.value })}
              placeholder="Décrivez votre image footer..."
              rows={2}
            />
          </div>

          <div className="form-group-premium">
            <label>Lien de redirection footer (optionnel)</label>
            <input
              type="url"
              value={config.footerImageLink || ''}
              onChange={(e) => onConfigUpdate({ footerImageLink: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Background Images per Device */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Images de fond par appareil</h4>
        
        <div className="space-y-6">
          {/* Desktop Background */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-sidebar-text-primary">Fond Desktop</label>
            <ImageUpload
              value={config.deviceConfig?.desktop?.backgroundImage || ''}
              onChange={(value) => onConfigUpdate({
                deviceConfig: {
                  mobile: { fontSize: 14, ...config.deviceConfig?.mobile },
                  tablet: { fontSize: 16, ...config.deviceConfig?.tablet },
                  desktop: {
                    fontSize: config.deviceConfig?.desktop?.fontSize || 18,
                    backgroundImage: value
                  }
                }
              })}
              label="Image de fond desktop"
              accept="image/*"
              compact
            />
          </div>

          {/* Tablet Background */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-sidebar-text-primary">Fond Tablette</label>
            <ImageUpload
              value={config.deviceConfig?.tablet?.backgroundImage || ''}
              onChange={(value) => onConfigUpdate({
                deviceConfig: {
                  mobile: { fontSize: 14, ...config.deviceConfig?.mobile },
                  tablet: {
                    fontSize: config.deviceConfig?.tablet?.fontSize || 16,
                    backgroundImage: value
                  },
                  desktop: { fontSize: 18, ...config.deviceConfig?.desktop }
                }
              })}
              label="Image de fond tablette"
              accept="image/*"
              compact
            />
          </div>

          {/* Mobile Background */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-sidebar-text-primary">Fond Mobile</label>
            <ImageUpload
              value={config.deviceConfig?.mobile?.backgroundImage || ''}
              onChange={(value) => onConfigUpdate({
                deviceConfig: {
                  mobile: {
                    fontSize: config.deviceConfig?.mobile?.fontSize || 14,
                    backgroundImage: value
                  },
                  tablet: { fontSize: 16, ...config.deviceConfig?.tablet },
                  desktop: { fontSize: 18, ...config.deviceConfig?.desktop }
                }
              })}
              label="Image de fond mobile"
              accept="image/*"
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesTab;
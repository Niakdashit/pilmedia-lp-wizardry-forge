import React from 'react';
import { FileText } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface FooterTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FooterTab: React.FC<FooterTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Configuration du footer */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Configuration du footer
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du footer</label>
            <textarea
              value={config.footerText || ''}
              onChange={(e) => onConfigUpdate({ footerText: e.target.value })}
              rows={3}
              placeholder="Texte à afficher dans le footer (optionnel)..."
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond du footer</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.footerColor || '#f8f9fa'}
                onChange={(e) => onConfigUpdate({ footerColor: e.target.value })}
              />
              <input
                type="text"
                value={config.footerColor || '#f8f9fa'}
                onChange={(e) => onConfigUpdate({ footerColor: e.target.value })}
                placeholder="#f8f9fa"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Informations</h4>
        
        <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
          <p className="text-sidebar-text-muted text-sm mb-3">
            Le footer n'est affiché que si du texte est saisi ci-dessus. 
            Il apparaîtra en bas du concours avec la couleur de fond choisie.
          </p>
          
          {config.footerText && config.footerText.trim() !== '' && (
            <div className="mt-4">
              <h5 className="text-sidebar-text-primary font-medium mb-2 text-sm">Aperçu :</h5>
              <div 
                className="p-3 rounded border text-center text-sm"
                style={{ 
                  backgroundColor: config.footerColor || '#f8f9fa',
                  color: '#495057'
                }}
              >
                {config.footerText}
              </div>
            </div>
          )}
          
          {(!config.footerText || config.footerText.trim() === '') && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              Aucun footer ne sera affiché car aucun texte n'est défini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterTab;
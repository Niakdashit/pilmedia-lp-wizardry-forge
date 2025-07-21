import React from 'react';
import { MousePointer } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';
interface ButtonsTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const ButtonsTab: React.FC<ButtonsTabProps> = ({
  config,
  onConfigUpdate
}) => {
  return <div className="space-y-6 py-[2px] my-[30px]">
      {/* Bouton de participation */}
      <div className="premium-card mx-[30px] py-0 my-0">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2 my-[30px]">
          <MousePointer className="w-4 h-4" />
          Bouton de participation
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du bouton</label>
            <input type="text" value={config.participateButtonText || 'PARTICIPER !'} onChange={e => onConfigUpdate({
            participateButtonText: e.target.value
          })} placeholder="PARTICIPER !" />
          </div>

          <div className="form-group-premium">
            <label>Couleur du bouton</label>
            <div className="color-input-group">
              <input type="color" value={config.participateButtonColor || '#ff6b35'} onChange={e => onConfigUpdate({
              participateButtonColor: e.target.value
            })} />
              <input type="text" value={config.participateButtonColor || '#ff6b35'} onChange={e => onConfigUpdate({
              participateButtonColor: e.target.value
            })} placeholder="#ff6b35" />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur du texte</label>
            <div className="color-input-group">
              <input type="color" value={config.participateButtonTextColor || '#ffffff'} onChange={e => onConfigUpdate({
              participateButtonTextColor: e.target.value
            })} />
              <input type="text" value={config.participateButtonTextColor || '#ffffff'} onChange={e => onConfigUpdate({
              participateButtonTextColor: e.target.value
            })} placeholder="#ffffff" />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Position du bouton de la roue</label>
            <select value={config.wheelButtonPosition || 'external'} onChange={e => onConfigUpdate({
            wheelButtonPosition: e.target.value as 'external' | 'center'
          })} className="w-full px-3 py-2 border border-sidebar-border rounded-lg bg-sidebar-surface text-sidebar-text-primary focus:outline-none focus:ring-2 focus:ring-primary-foreground my-[30px]">
              <option value="external">Bouton externe</option>
              <option value="center">Centre de la roue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Boutons sociaux */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Boutons sociaux</h4>
        
        <div className="space-y-4">
          <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                f
              </div>
              <span className="text-sidebar-text-primary font-medium">Facebook</span>
            </div>
            <p className="text-sidebar-text-muted text-sm">
              Bouton de partage Facebook intégré automatiquement dans le header de l'image.
            </p>
          </div>

          <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-sm font-bold">
                X
              </div>
              <span className="text-sidebar-text-primary font-medium">X (Twitter)</span>
            </div>
            <p className="text-sidebar-text-muted text-sm">
              Bouton de partage X intégré automatiquement dans le header de l'image.
            </p>
          </div>
        </div>
      </div>

      {/* Bouton Règlement */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Bouton Règlement</h4>
        
        <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
          <p className="text-sidebar-text-muted text-sm mb-3">
            Le bouton "Règlement" est automatiquement positionné en haut à droite de l'image.
          </p>
          <div className="inline-flex px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
            Règlement
          </div>
        </div>
      </div>

      {/* Aperçu du bouton */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Aperçu</h4>
        
        <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border text-center">
          <div className="inline-flex px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer" style={{
          backgroundColor: config.participateButtonColor || '#ff6b35',
          color: config.participateButtonTextColor || '#ffffff'
        }}>
            {config.participateButtonText || 'PARTICIPER !'}
          </div>
        </div>
      </div>
    </div>;
};
export default ButtonsTab;
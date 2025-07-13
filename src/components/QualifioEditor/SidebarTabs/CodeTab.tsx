import React from 'react';
import { Code, AlertTriangle } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface CodeTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const CodeTab: React.FC<CodeTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Avertissement */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-yellow-800 font-medium text-sm">Attention</h4>
            <p className="text-yellow-700 text-sm mt-1">
              Ces fonctionnalités sont destinées aux utilisateurs avancés. 
              Un code incorrect peut affecter le fonctionnement du concours.
            </p>
          </div>
        </div>
      </div>

      {/* CSS personnalisé */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          CSS personnalisé
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Styles CSS</label>
            <textarea
              value={config.customCSS || ''}
              onChange={(e) => onConfigUpdate({ customCSS: e.target.value })}
              rows={8}
              className="font-mono text-sm"
              placeholder="/* Ajoutez votre CSS personnalisé ici */&#10;.custom-element {&#10;  color: #ff6b35;&#10;  font-weight: bold;&#10;}"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>Conseil :</strong> Utilisez les sélecteurs CSS pour cibler des éléments spécifiques. 
              Par exemple : <code className="bg-blue-100 px-1 rounded">.wheel-container</code> pour la roue.
            </p>
          </div>
        </div>
      </div>

      {/* JavaScript personnalisé */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          JavaScript personnalisé
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Code JavaScript</label>
            <textarea
              value={config.customJS || ''}
              onChange={(e) => onConfigUpdate({ customJS: e.target.value })}
              rows={8}
              className="font-mono text-sm"
              placeholder="// Ajoutez votre JavaScript personnalisé ici&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('Concours chargé');&#10;});"
            />
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-orange-800 text-sm">
              <strong>Important :</strong> Évitez de modifier les fonctions principales du concours. 
              Concentrez-vous sur l'ajout de fonctionnalités supplémentaires.
            </p>
          </div>
        </div>
      </div>

      {/* Tags de tracking */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          Tags de tracking
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Codes de suivi</label>
            <textarea
              value={config.trackingTags || ''}
              onChange={(e) => onConfigUpdate({ trackingTags: e.target.value })}
              rows={6}
              className="font-mono text-sm"
              placeholder="<!-- Ajoutez vos tags de tracking ici -->&#10;<!-- Google Analytics, Facebook Pixel, etc. -->&#10;<script>&#10;  // Votre code de tracking&#10;</script>"
            />
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              <strong>Exemples courants :</strong> Google Analytics, Facebook Pixel, Google Tag Manager, 
              codes de conversion, pixels de retargeting.
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu du code */}
      <div className="premium-card">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Aperçu</h4>
        
        <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sidebar-text-primary font-medium text-lg">
                {config.customCSS ? config.customCSS.split('\n').length : 0}
              </div>
              <div className="text-sidebar-text-muted text-sm">Lignes CSS</div>
            </div>
            <div>
              <div className="text-sidebar-text-primary font-medium text-lg">
                {config.customJS ? config.customJS.split('\n').length : 0}
              </div>
              <div className="text-sidebar-text-muted text-sm">Lignes JS</div>
            </div>
            <div>
              <div className="text-sidebar-text-primary font-medium text-lg">
                {config.trackingTags ? config.trackingTags.split('\n').length : 0}
              </div>
              <div className="text-sidebar-text-muted text-sm">Lignes Tags</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeTab;
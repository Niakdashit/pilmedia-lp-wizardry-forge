
import React from 'react';
import { MousePointer, FileText, Code, AlertTriangle, Check } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface FinalizationTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FinalizationTab: React.FC<FinalizationTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const addFormField = () => {
    const newField = {
      id: Date.now().toString(),
      label: 'Nouveau champ',
      type: 'text' as const,
      required: false,
      placeholder: ''
    };
    
    onConfigUpdate({
      formFields: [...(config.formFields || []), newField]
    });
  };

  const updateFormField = (fieldId: string, updates: any) => {
    onConfigUpdate({
      formFields: (config.formFields || []).map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    });
  };

  const removeFormField = (fieldId: string) => {
    onConfigUpdate({
      formFields: (config.formFields || []).filter(field => field.id !== fieldId)
    });
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center">Finalisation</h3>
      
      {/* Buttons Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <MousePointer className="w-4 h-4" />
          Boutons et interactions
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du bouton de participation</label>
            <input
              type="text"
              value={config.participateButtonText || 'PARTICIPER !'}
              onChange={e => onConfigUpdate({ participateButtonText: e.target.value })}
              placeholder="PARTICIPER !"
            />
          </div>

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

          {config.gameType === 'wheel' && (
            <div className="form-group-premium">
              <label>Position du bouton de la roue</label>
              <select
                value={config.wheelButtonPosition || 'external'}
                onChange={e => onConfigUpdate({ wheelButtonPosition: e.target.value as 'external' | 'center' })}
              >
                <option value="external">Bouton externe</option>
                <option value="center">Centre de la roue</option>
              </select>
            </div>
          )}

          {/* Button Preview */}
          <div className="bg-sidebar-surface rounded-lg p-4 border border-sidebar-border text-center">
            <div 
              className="inline-flex px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: config.participateButtonColor || '#ff6b35',
                color: config.participateButtonTextColor || '#ffffff'
              }}
            >
              {config.participateButtonText || 'PARTICIPER !'}
            </div>
          </div>
        </div>
      </div>

      {/* Form Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Formulaire de participation
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Titre du formulaire</label>
            <input
              type="text"
              value={config.formTitle || ''}
              onChange={e => onConfigUpdate({ formTitle: e.target.value })}
              placeholder="Formulaire de participation"
            />
          </div>

          <div className="form-group-premium">
            <label>Message de succès</label>
            <input
              type="text"
              value={config.formSuccessMessage || ''}
              onChange={e => onConfigUpdate({ formSuccessMessage: e.target.value })}
              placeholder="Merci pour votre participation !"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sidebar-text-primary text-sm">Afficher la progression</label>
            <input
              type="checkbox"
              checked={config.formShowProgress || false}
              onChange={e => onConfigUpdate({ formShowProgress: e.target.checked })}
              className="rounded"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sidebar-text-primary font-medium text-sm">Champs du formulaire</span>
              <button
                onClick={addFormField}
                className="text-sm bg-brand-primary text-white px-3 py-1 rounded hover:bg-brand-primary/90 transition-colors"
              >
                + Ajouter
              </button>
            </div>

            {config.formFields && config.formFields.length > 0 ? (
              <div className="space-y-2">
                {config.formFields.map(field => (
                  <div key={field.id} className="bg-sidebar-surface rounded-lg p-3 border border-sidebar-border">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateFormField(field.id, { label: e.target.value })}
                        className="font-medium bg-transparent border-0 p-0 text-sm flex-1"
                        placeholder="Label du champ"
                      />
                      <button
                        onClick={() => removeFormField(field.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <select
                        value={field.type}
                        onChange={e => updateFormField(field.id, { type: e.target.value })}
                        className="text-xs border rounded px-1"
                      >
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="tel">Téléphone</option>
                        <option value="select">Liste</option>
                        <option value="textarea">Zone de texte</option>
                        <option value="checkbox">Case à cocher</option>
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={e => updateFormField(field.id, { required: e.target.checked })}
                          className="text-xs"
                        />
                        Requis
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sidebar-text-muted text-sm">
                Aucun champ ajouté
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Configuration */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Pied de page</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du footer</label>
            <input
              type="text"
              value={config.footerText || ''}
              onChange={e => onConfigUpdate({ footerText: e.target.value })}
              placeholder="Texte optionnel en bas de page"
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond du footer</label>
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

      {/* Advanced Code Section */}
      <div className="premium-card mx-[30px]">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-medium text-sm">Code avancé</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Réservé aux utilisateurs expérimentés. Un code incorrect peut affecter le fonctionnement.
              </p>
            </div>
          </div>
        </div>

        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code personnalisé
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>CSS personnalisé</label>
            <textarea
              value={config.customCSS || ''}
              onChange={e => onConfigUpdate({ customCSS: e.target.value })}
              rows={4}
              className="font-mono text-sm"
              placeholder="/* Votre CSS personnalisé */"
            />
          </div>

          <div className="form-group-premium">
            <label>JavaScript personnalisé</label>
            <textarea
              value={config.customJS || ''}
              onChange={e => onConfigUpdate({ customJS: e.target.value })}
              rows={4}
              className="font-mono text-sm"
              placeholder="// Votre JavaScript personnalisé"
            />
          </div>

          <div className="form-group-premium">
            <label>Tags de tracking</label>
            <textarea
              value={config.trackingTags || ''}
              onChange={e => onConfigUpdate({ trackingTags: e.target.value })}
              rows={3}
              className="font-mono text-sm"
              placeholder="<!-- Vos tags de suivi -->"
            />
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Check className="w-4 h-4" />
          État de la configuration
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Bouton configuré</span>
            <span className={config.participateButtonText ? 'text-green-600' : 'text-gray-400'}>
              {config.participateButtonText ? '✓' : '○'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Formulaire configuré</span>
            <span className={config.formFields?.length ? 'text-green-600' : 'text-gray-400'}>
              {config.formFields?.length ? '✓' : '○'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Code personnalisé</span>
            <span className={config.customCSS || config.customJS ? 'text-green-600' : 'text-gray-400'}>
              {config.customCSS || config.customJS ? '✓' : '○'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizationTab;

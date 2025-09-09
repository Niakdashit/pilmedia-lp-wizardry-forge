import React, { useState } from 'react';
import { FileText, Settings, Mail, Shield, CheckCircle, AlertCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface FormGamePanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const FormGamePanel: React.FC<FormGamePanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const formConfig = config.gameConfig?.form || config.design?.formConfig || {};
  const fields = formConfig.fields || [];
  const validation = formConfig.validation || {};
  const buttonConfig = config.buttonConfig || formConfig.buttonConfig || {};

  const updateFormConfig = (updates: any) => {
    onConfigUpdate({
      gameConfig: {
        ...config.gameConfig,
        form: {
          ...formConfig,
          ...updates
        }
      },
      design: {
        ...config.design,
        formConfig: {
          ...formConfig,
          ...updates
        }
      }
    });
  };

  const updateButtonConfig = (updates: any) => {
    onConfigUpdate({
      buttonConfig: {
        ...buttonConfig,
        ...updates
      }
    });
    
    // Synchroniser avec la config du formulaire
    updateFormConfig({
      buttonConfig: {
        ...buttonConfig,
        ...updates
      }
    });
  };

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Nouveau champ',
      placeholder: 'Saisissez votre texte',
      required: false,
      validation: {}
    };
    
    updateFormConfig({
      fields: [...fields, newField]
    });
  };

  const updateField = (fieldId: string, updates: any) => {
    const updatedFields = fields.map((field: any) =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    updateFormConfig({
      fields: updatedFields
    });
  };

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter((field: any) => field.id !== fieldId);
    updateFormConfig({
      fields: updatedFields
    });
  };

  const fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Téléphone' },
    { value: 'number', label: 'Nombre' },
    { value: 'textarea', label: 'Zone de texte' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'checkbox', label: 'Case à cocher' },
    { value: 'radio', label: 'Bouton radio' }
  ];

  return (
    <div className="space-y-6">
      {/* Configuration du bouton */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Bouton de soumission
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={buttonConfig.text || formConfig.buttonText || 'Envoyer'}
              onChange={(e) => updateButtonConfig({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Envoyer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte pendant l'envoi
            </label>
            <input
              type="text"
              value={buttonConfig.loadingText || formConfig.loadingText || 'Envoi en cours...'}
              onChange={(e) => updateButtonConfig({ loadingText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Envoi en cours..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur du bouton
            </label>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                style={{ backgroundColor: buttonConfig.color || formConfig.buttonColor || '#3b82f6' }}
                onClick={() => document.getElementById('buttonColorPicker')?.click()}
              />
              <input
                id="buttonColorPicker"
                type="color"
                value={buttonConfig.color || formConfig.buttonColor || '#3b82f6'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={buttonConfig.color || formConfig.buttonColor || '#3b82f6'}
                onChange={(e) => updateButtonConfig({ color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des champs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Champs du formulaire
          </h3>
          <button
            onClick={addField}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un champ
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun champ configuré</p>
            <p className="text-sm">Cliquez sur "Ajouter un champ" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field: any, index: number) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <input
                      type="text"
                      value={field.label || ''}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0"
                      placeholder="Libellé du champ"
                    />
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type de champ
                    </label>
                    <select
                      value={field.type || 'text'}
                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Texte d'aide"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Champ obligatoire</span>
                  </label>

                  {field.type === 'email' && (
                    <div className="flex items-center text-xs text-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Validation email automatique
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages de validation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Messages de validation
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message de succès
            </label>
            <textarea
              value={validation.successMessage || 'Merci ! Votre formulaire a été envoyé avec succès.'}
              onChange={(e) => updateFormConfig({
                validation: {
                  ...validation,
                  successMessage: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Message affiché après envoi réussi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message d'erreur
            </label>
            <textarea
              value={validation.errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
              onChange={(e) => updateFormConfig({
                validation: {
                  ...validation,
                  errorMessage: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Message affiché en cas d'erreur"
            />
          </div>
        </div>
      </div>

      {/* Paramètres avancés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          Paramètres avancés
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Notifications par email</div>
              <div className="text-xs text-gray-500">Recevoir un email à chaque soumission</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formConfig.emailNotifications !== false}
                onChange={(e) => updateFormConfig({ emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Protection anti-spam</div>
              <div className="text-xs text-gray-500">Activer la protection contre le spam</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formConfig.enableSpamProtection !== false}
                onChange={(e) => updateFormConfig({ enableSpamProtection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Collecte d'analytics</div>
              <div className="text-xs text-gray-500">Suivre les interactions avec le formulaire</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formConfig.collectAnalytics !== false}
                onChange={(e) => updateFormConfig({ collectAnalytics: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redirection après soumission (optionnel)
            </label>
            <input
              type="url"
              value={formConfig.redirectAfterSubmit || ''}
              onChange={(e) => updateFormConfig({ redirectAfterSubmit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/merci"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL vers laquelle rediriger l'utilisateur après envoi du formulaire
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-green-600" />
          Statistiques
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {formConfig.submissionsCount || 0}
            </div>
            <div className="text-sm text-blue-700">Soumissions</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {fields.length}
            </div>
            <div className="text-sm text-green-700">Champs</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-2">Taux de conversion estimé</div>
          <div className="text-xs text-gray-500">
            Formulaires avec {fields.length} champs : ~{Math.max(85 - fields.length * 5, 45)}% de taux de conversion
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormGamePanel;

import React from 'react';
import { CheckSquare, AlertCircle, CheckCircle, Mail, Shield } from 'lucide-react';

interface FormValidationPanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const FormValidationPanel: React.FC<FormValidationPanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const validation = config.validation || {};
  const settings = config.settings || {};

  const updateValidation = (updates: any) => {
    onConfigUpdate({
      validation: {
        ...validation,
        ...updates
      }
    });
  };

  const updateSettings = (updates: any) => {
    onConfigUpdate({
      settings: {
        ...settings,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Messages de validation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
          Messages de validation
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message de succès
            </label>
            <textarea
              value={validation.successMessage || 'Merci ! Votre formulaire a été envoyé avec succès.'}
              onChange={(e) => updateValidation({ successMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Message affiché après un envoi réussi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message d'erreur général
            </label>
            <textarea
              value={validation.errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
              onChange={(e) => updateValidation({ errorMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Message affiché en cas d'erreur"
            />
          </div>
        </div>
      </div>

      {/* Comportement de validation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Comportement
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Afficher les erreurs à la soumission</div>
              <div className="text-xs text-gray-500">Les erreurs apparaissent uniquement quand l'utilisateur soumet</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={validation.showErrorsOnSubmit !== false}
                onChange={(e) => updateValidation({ showErrorsOnSubmit: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Validation en temps réel</div>
              <div className="text-xs text-gray-500">Valide les champs pendant que l'utilisateur tape</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={validation.realTimeValidation === true}
                onChange={(e) => updateValidation({ realTimeValidation: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Afficher le message de succès</div>
              <div className="text-xs text-gray-500">Montre une confirmation après l'envoi réussi</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={validation.showSuccessMessage !== false}
                onChange={(e) => updateValidation({ showSuccessMessage: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sécurité et protection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-red-600" />
          Sécurité
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Protection anti-spam</div>
              <div className="text-xs text-gray-500">Active la protection contre les soumissions automatisées</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSpamProtection !== false}
                onChange={(e) => updateSettings({ enableSpamProtection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Limitation de débit</div>
              <div className="text-xs text-gray-500">Limite le nombre de soumissions par IP</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRateLimit === true}
                onChange={(e) => updateSettings({ enableRateLimit: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.enableRateLimit && (
            <div className="ml-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-blue-700 mb-1">
                    Max soumissions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxSubmissions || 5}
                    onChange={(e) => updateSettings({ maxSubmissions: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-blue-700 mb-1">
                    Période (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={settings.rateLimitPeriod || 60}
                    onChange={(e) => updateSettings({ rateLimitPeriod: parseInt(e.target.value) })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-blue-600" />
          Notifications
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Notifications par email</div>
              <div className="text-xs text-gray-500">Recevoir un email à chaque soumission</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications !== false}
                onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.emailNotifications && (
            <div className="ml-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  Adresse email de notification
                </label>
                <input
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Email de confirmation</div>
              <div className="text-xs text-gray-500">Envoyer un email de confirmation à l'utilisateur</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sendConfirmationEmail === true}
                onChange={(e) => updateSettings({ sendConfirmationEmail: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Redirection après soumission */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Après soumission
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de redirection (optionnel)
            </label>
            <input
              type="url"
              value={settings.redirectAfterSubmit || ''}
              onChange={(e) => updateSettings({ redirectAfterSubmit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/merci"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si vide, l'utilisateur reste sur la page avec le message de succès
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Collecter les analytics</div>
              <div className="text-xs text-gray-500">Enregistrer les statistiques de soumission</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.collectAnalytics !== false}
                onChange={(e) => updateSettings({ collectAnalytics: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Résumé de la configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">📋 Résumé de la configuration</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Validation en temps réel:</div>
            <div className={validation.realTimeValidation ? 'text-green-600' : 'text-red-600'}>
              {validation.realTimeValidation ? 'Activée' : 'Désactivée'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Protection anti-spam:</div>
            <div className={settings.enableSpamProtection !== false ? 'text-green-600' : 'text-red-600'}>
              {settings.enableSpamProtection !== false ? 'Activée' : 'Désactivée'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Notifications email:</div>
            <div className={settings.emailNotifications !== false ? 'text-green-600' : 'text-red-600'}>
              {settings.emailNotifications !== false ? 'Activées' : 'Désactivées'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Redirection:</div>
            <div className={settings.redirectAfterSubmit ? 'text-green-600' : 'text-gray-500'}>
              {settings.redirectAfterSubmit ? 'Configurée' : 'Aucune'}
            </div>
          </div>
        </div>
      </div>

      {/* Conseils de validation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">⚡ Conseils de validation</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Activez la validation en temps réel pour une meilleure UX</li>
          <li>• Utilisez des messages d'erreur clairs et utiles</li>
          <li>• Testez la protection anti-spam régulièrement</li>
          <li>• Configurez les notifications pour ne rien manquer</li>
        </ul>
      </div>
    </div>
  );
};

export default FormValidationPanel;

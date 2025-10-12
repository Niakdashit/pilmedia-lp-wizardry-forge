
import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';

const FormConfiguration: React.FC = () => {
  const formFields = [
    { id: 1, type: 'text', label: 'Nom', required: true },
    { id: 2, type: 'email', label: 'Email', required: true },
    { id: 3, type: 'phone', label: 'Téléphone', required: false }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configuration Formulaire</h3>
        </div>
        <button className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700">
          <Plus className="w-4 h-4" />
          <span>Ajouter un champ</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Champs du formulaire */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Champs du formulaire</h4>
          
          <div className="space-y-3">
            {formFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Champ {index + 1}</span>
                  {formFields.length > 2 && (
                    <button className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de champ
                    </label>
                    <select
                      value={field.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="text">Texte</option>
                      <option value="email">Email</option>
                      <option value="phone">Téléphone</option>
                      <option value="number">Nombre</option>
                      <option value="date">Date</option>
                      <option value="select">Liste déroulante</option>
                      <option value="textarea">Zone de texte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Libellé
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700">
                    Champ obligatoire
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration de validation */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Validation et soumission</h4>
          
          <div className="bg-green-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="captcha"
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="captcha" className="text-sm font-medium text-gray-700">
                Activer la protection anti-spam (CAPTCHA)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newsletter"
                defaultChecked
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="newsletter" className="text-sm font-medium text-gray-700">
                Abonnement newsletter (case à cocher)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="conditions"
                defaultChecked
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="conditions" className="text-sm font-medium text-gray-700">
                Acceptation des conditions d'utilisation
              </label>
            </div>
          </div>
        </div>

        {/* Messages de confirmation */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Messages</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message de succès
              </label>
              <input
                type="text"
                defaultValue="Merci ! Votre formulaire a été envoyé avec succès."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message d'erreur
              </label>
              <input
                type="text"
                defaultValue="Une erreur s'est produite. Veuillez réessayer."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormConfiguration;

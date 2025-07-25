import React from 'react';
import { Shield, UserCheck, Lock, AlertTriangle } from 'lucide-react';

const SecurityPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Authentification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserCheck className="w-4 h-4 inline mr-2" />
          Authentification requise
        </label>
        <div className="space-y-3">
          {[
            { id: 'email', label: 'Email uniquement', desc: 'Adresse email valide' },
            { id: 'social', label: 'Réseaux sociaux', desc: 'Facebook, Google, etc.' },
            { id: 'phone', label: 'Numéro de téléphone', desc: 'Vérification SMS' },
            { id: 'full', label: 'Inscription complète', desc: 'Profil utilisateur complet' }
          ].map((auth) => (
            <div key={auth.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
              <input
                type="radio"
                name="auth-type"
                id={auth.id}
                className="mt-1 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor={auth.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {auth.label}
                </label>
                <p className="text-xs text-gray-500">{auth.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prévention de la fraude */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="w-4 h-4 inline mr-2" />
          Protection anti-fraude
        </label>
        <div className="space-y-2">
          {[
            { id: 'ip-limit', label: 'Limitation par IP', desc: 'Max 5 tentatives par IP' },
            { id: 'device-fingerprint', label: 'Empreinte device', desc: 'Détection des devices' },
            { id: 'captcha', label: 'CAPTCHA', desc: 'Vérification humaine' },
            { id: 'geolocation', label: 'Géolocalisation', desc: 'Restriction géographique' }
          ].map((protection) => (
            <div key={protection.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
              <input
                type="checkbox"
                id={protection.id}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor={protection.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {protection.label}
                </label>
                <p className="text-xs text-gray-500">{protection.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modération */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          Modération
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="auto-moderation"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="auto-moderation" className="text-sm text-gray-700">
              Modération automatique des contenus
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="manual-validation"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="manual-validation" className="text-sm text-gray-700">
              Validation manuelle des gains
            </label>
          </div>
        </div>
      </div>

      {/* Conformité RGPD */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Conformité légale
        </label>
        <div className="space-y-2">
          {[
            { id: 'rgpd', label: 'Conformité RGPD', required: true },
            { id: 'terms', label: 'CGU obligatoires', required: true },
            { id: 'age-verify', label: 'Vérification âge (18+)', required: false },
            { id: 'data-export', label: 'Export données utilisateur', required: true }
          ].map((compliance) => (
            <div key={compliance.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
              <input
                type="checkbox"
                id={compliance.id}
                defaultChecked={compliance.required}
                disabled={compliance.required}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={compliance.id} className={`text-sm cursor-pointer ${
                compliance.required ? 'text-gray-900 font-medium' : 'text-gray-700'
              }`}>
                {compliance.label}
                {compliance.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
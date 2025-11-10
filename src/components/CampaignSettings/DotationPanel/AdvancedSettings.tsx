import React from 'react';
import { DotationConfig } from '@/types/dotation';

interface AdvancedSettingsProps {
  config: DotationConfig;
  onChange: (config: DotationConfig) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ config, onChange }) => {
  return (
    <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
      {/* Stratégie globale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordre de priorité des lots
        </label>
        <select
          value={config.globalStrategy?.priorityOrder || 'sequential'}
          onChange={(e) => onChange({
            ...config,
            globalStrategy: {
              ...config.globalStrategy,
              priorityOrder: e.target.value as any
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        >
          <option value="sequential">Séquentiel (ordre défini)</option>
          <option value="random">Aléatoire</option>
          <option value="weighted">Pondéré (par priorité)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Détermine l'ordre dans lequel les lots sont proposés aux participants
        </p>
      </div>

      {/* Anti-fraude */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max gains par IP
          </label>
          <input
            type="number"
            min="1"
            value={config.antiFraud?.maxWinsPerIP || 1}
            onChange={(e) => onChange({
              ...config,
              antiFraud: {
                ...config.antiFraud,
                maxWinsPerIP: parseInt(e.target.value) || 1
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max gains par email
          </label>
          <input
            type="number"
            min="1"
            value={config.antiFraud?.maxWinsPerEmail || 1}
            onChange={(e) => onChange({
              ...config,
              antiFraud: {
                ...config.antiFraud,
                maxWinsPerEmail: parseInt(e.target.value) || 1
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max gains par appareil
          </label>
          <input
            type="number"
            min="1"
            value={config.antiFraud?.maxWinsPerDevice || 1}
            onChange={(e) => onChange({
              ...config,
              antiFraud: {
                ...config.antiFraud,
                maxWinsPerDevice: parseInt(e.target.value) || 1
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période de vérification (heures)
          </label>
          <input
            type="number"
            min="1"
            value={config.antiFraud?.verificationPeriod || 24}
            onChange={(e) => onChange({
              ...config,
              antiFraud: {
                ...config.antiFraud,
                verificationPeriod: parseInt(e.target.value) || 24
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notifications?.notifyAdminOnWin || false}
            onChange={(e) => onChange({
              ...config,
              notifications: {
                ...config.notifications,
                notifyAdminOnWin: e.target.checked
              }
            })}
            className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]"
          />
          <span className="text-sm text-gray-700">Notifier l'admin quand un lot est gagné</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.notifications?.notifyAdminOnExhaustion || false}
            onChange={(e) => onChange({
              ...config,
              notifications: {
                ...config.notifications,
                notifyAdminOnExhaustion: e.target.checked
              }
            })}
            className="rounded border-gray-300 text-[#841b60] focus:ring-[#841b60]"
          />
          <span className="text-sm text-gray-700">Notifier l'admin quand un lot est épuisé</span>
        </label>

        {(config.notifications?.notifyAdminOnWin || config.notifications?.notifyAdminOnExhaustion) && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de notification
            </label>
            <input
              type="email"
              value={config.notifications?.adminEmail || ''}
              onChange={(e) => onChange({
                ...config,
                notifications: {
                  ...config.notifications,
                  adminEmail: e.target.value
                }
              })}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};

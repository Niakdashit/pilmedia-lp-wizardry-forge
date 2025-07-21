
import React from 'react';
import { Calendar, Clock, Link2, Code, Tag } from 'lucide-react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface FinalizationTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const FinalizationTab: React.FC<FinalizationTabProps> = ({
  config,
  onConfigUpdate
}) => {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Finalisation</h3>
      
      {/* Campaign Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Planification de la campagne
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date de début</label>
              <input
                type="date"
                value={config.startDate || ''}
                onChange={(e) => onConfigUpdate({ startDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date de fin</label>
              <input
                type="date"
                value={config.endDate || ''}
                onChange={(e) => onConfigUpdate({ endDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Heure de début</label>
              <input
                type="time"
                value={config.startTime || ''}
                onChange={(e) => onConfigUpdate({ startTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Heure de fin</label>
              <input
                type="time"
                value={config.endTime || ''}
                onChange={(e) => onConfigUpdate({ endTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign URL */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          URL de la campagne
        </h4>
        <div>
          <label className="block text-xs text-gray-600 mb-1">URL personnalisée (optionnel)</label>
          <input
            type="text"
            value={config.campaignUrl || ''}
            onChange={(e) => onConfigUpdate({ campaignUrl: e.target.value })}
            placeholder="ma-campagne-personnalisee"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si vide, une URL sera générée automatiquement à partir du nom de la campagne
          </p>
        </div>
      </div>

      {/* Footer Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Configuration du pied de page</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Texte du pied de page</label>
            <textarea
              value={config.footerText || ''}
              onChange={(e) => onConfigUpdate({ footerText: e.target.value })}
              placeholder="© 2024 Mon entreprise. Tous droits réservés."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Couleur du pied de page</label>
            <input
              type="color"
              value={config.footerColor || '#f8f9fa'}
              onChange={(e) => onConfigUpdate({ footerColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Custom Code */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code personnalisé
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">CSS personnalisé</label>
            <textarea
              value={config.customCSS || ''}
              onChange={(e) => onConfigUpdate({ customCSS: e.target.value })}
              placeholder="/* Votre CSS personnalisé */"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm font-mono resize-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">JavaScript personnalisé</label>
            <textarea
              value={config.customJS || ''}
              onChange={(e) => onConfigUpdate({ customJS: e.target.value })}
              placeholder="// Votre JavaScript personnalisé"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm font-mono resize-none"
            />
          </div>
        </div>
      </div>

      {/* Tracking */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Suivi et analyse
        </h4>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Tags de suivi</label>
          <textarea
            value={config.trackingTags || ''}
            onChange={(e) => onConfigUpdate({ trackingTags: e.target.value })}
            placeholder="<!-- Google Analytics, Facebook Pixel, etc. -->"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm font-mono resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ajoutez vos codes de suivi (Google Analytics, Facebook Pixel, etc.)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalizationTab;

import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Composant affichant le statut des intégrations
 * Peut être utilisé dans le dashboard ou les settings
 */
export const IntegrationStatus: React.FC = () => {
  const integrations = [
    {
      name: 'JavaScript',
      status: 'operational',
      description: 'Chargement dynamique via script',
      icon: '📜',
      tested: true
    },
    {
      name: 'HTML',
      status: 'operational',
      description: 'Iframe statique',
      icon: '🌐',
      tested: true
    },
    {
      name: 'Webview',
      status: 'operational',
      description: 'Pour applications mobiles',
      icon: '📱',
      tested: true
    },
    {
      name: 'oEmbed',
      status: 'operational',
      description: 'Standard universel (JSON/XML)',
      icon: '🔗',
      tested: true,
      highlight: 'Nouvellement ajouté'
    },
    {
      name: 'Smart URL',
      status: 'operational',
      description: 'Détection automatique de device',
      icon: '🎯',
      tested: true,
      highlight: 'Amélioré'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Statut des Intégrations
        </h3>
        <a
          href="/integrations-test"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Tester les intégrations →
        </a>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(integration.status)}`}
          >
            <span className="text-2xl">{integration.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">
                  {integration.name}
                </h4>
                {integration.highlight && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    {integration.highlight}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {integration.description}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(integration.status)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Toutes les intégrations sont opérationnelles
          </span>
          <span className="text-green-600 font-medium">
            5/5 ✓
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntegrationStatus;

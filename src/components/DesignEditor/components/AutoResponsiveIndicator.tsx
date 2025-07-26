import React from 'react';
import { Monitor, Tablet, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';

interface AutoResponsiveIndicatorProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  adaptationSuggestions: Array<{
    elementId: string;
    device: 'desktop' | 'tablet' | 'mobile';
    issue: string;
    suggestion: string;
  }>;
}

const AutoResponsiveIndicator: React.FC<AutoResponsiveIndicatorProps> = ({
  selectedDevice,
  adaptationSuggestions
}) => {
  const getDeviceIcon = (device: 'desktop' | 'tablet' | 'mobile') => {
    switch (device) {
      case 'desktop': return Monitor;
      case 'tablet': return Tablet;
      case 'mobile': return Smartphone;
    }
  };

  const getDeviceStatus = (device: 'desktop' | 'tablet' | 'mobile') => {
    const deviceSuggestions = adaptationSuggestions.filter(s => s.device === device);
    return deviceSuggestions.length === 0 ? 'good' : 'warning';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="font-medium text-gray-800">Auto-Responsive Actif</h3>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Vos éléments s'adaptent automatiquement à tous les appareils
      </div>

      {/* Status des appareils */}
      <div className="space-y-2">
        {(['desktop', 'tablet', 'mobile'] as const).map(device => {
          const Icon = getDeviceIcon(device);
          const status = getDeviceStatus(device);
          const isCurrentDevice = selectedDevice === device;
          const deviceSuggestions = adaptationSuggestions.filter(s => s.device === device);
          
          return (
            <div 
              key={device} 
              className={`flex items-center gap-3 p-2 rounded ${
                isCurrentDevice ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isCurrentDevice ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium capitalize ${
                isCurrentDevice ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablette' : 'Mobile'}
              </span>
              <div className="ml-auto">
                {status === 'good' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">
                      {deviceSuggestions.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestions d'amélioration */}
      {adaptationSuggestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Suggestions d'amélioration</h4>
          <div className="space-y-1">
            {adaptationSuggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                <div className="font-medium text-yellow-700">
                  {suggestion.device}: {suggestion.issue}
                </div>
                <div>{suggestion.suggestion}</div>
              </div>
            ))}
            {adaptationSuggestions.length > 3 && (
              <div className="text-xs text-gray-400 text-center pt-1">
                +{adaptationSuggestions.length - 3} autres suggestions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoResponsiveIndicator;
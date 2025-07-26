import React from 'react';
import ResponsiveModeToggle from '../components/ResponsiveModeToggle';
import DevicePreviewSidebar from '../components/DevicePreviewSidebar';
import { useAutoResponsive } from '../hooks/useAutoResponsive';
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface ResponsivePanelProps {
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  background: any;
}

const ResponsivePanel: React.FC<ResponsivePanelProps> = ({
  elements,
  onElementsChange,
  selectedDevice,
  onDeviceChange,
  background
}) => {
  const {
    config,
    updateConfig,
    toggleExpertMode,
    detectedIssues,
    isAnalyzing,
    analyzeResponsiveIssues,
    applyAutoResponsive,
  } = useAutoResponsive();

  React.useEffect(() => {
    if (config.autoDetectIssues) {
      analyzeResponsiveIssues(elements, selectedDevice);
    }
  }, [elements, selectedDevice, analyzeResponsiveIssues, config.autoDetectIssues]);

  React.useEffect(() => {
    if (config.isAutoMode) {
      const responsiveElements = applyAutoResponsive(elements, selectedDevice);
      if (JSON.stringify(responsiveElements) !== JSON.stringify(elements)) {
        onElementsChange(responsiveElements);
      }
    }
  }, [selectedDevice, config.isAutoMode, config.baseDevice]);

  const handleFixIssue = (issueId: string) => {
    const issue = detectedIssues.find(i => i.id === issueId);
    if (!issue || !issue.element) return;

    const updatedElements = elements.map(el => {
      if (el === issue.element) {
        switch (issue.type) {
          case 'text-too-small':
            return { ...el, style: { ...el.style, fontSize: '14px' } };
          case 'element-overflow':
            return { ...el, x: Math.max(0, el.x - 50), width: Math.min(el.width || 100, 400) };
          default:
            return el;
        }
      }
      return el;
    });

    onElementsChange(updatedElements);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <ResponsiveModeToggle
        isExpertMode={config.isExpertMode}
        isAutoMode={config.isAutoMode}
        onToggleExpert={toggleExpertMode}
        onToggleAuto={(enabled) => updateConfig({ isAutoMode: enabled })}
        issuesCount={detectedIssues.length}
      />

      {/* Device Preview */}
      <DevicePreviewSidebar
        selectedDevice={selectedDevice}
        onDeviceChange={onDeviceChange}
        elements={elements}
        background={background}
        isAutoMode={config.isAutoMode}
      />

      {/* Smart Defaults Settings */}
      {config.isAutoMode && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Paramètres Auto-Responsive</h3>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.smartDefaults}
                onChange={(e) => updateConfig({ smartDefaults: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Adaptation intelligente des tailles</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={config.autoDetectIssues}
                onChange={(e) => updateConfig({ autoDetectIssues: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Détection automatique des problèmes</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appareil de référence
              </label>
              <select
                value={config.baseDevice}
                onChange={(e) => updateConfig({ baseDevice: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desktop">Desktop (1200px)</option>
                <option value="tablet">Tablet (850px)</option>
                <option value="mobile">Mobile (520px)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Issues Detection */}
      {config.autoDetectIssues && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Problèmes détectés</h3>
            {isAnalyzing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>

          {detectedIssues.length === 0 ? (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Aucun problème détecté
            </div>
          ) : (
            <div className="space-y-3">
              {detectedIssues.map((issue) => (
                <div key={issue.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800">{issue.message}</p>
                        {issue.suggestion && (
                          <div className="flex items-center mt-1 text-xs text-amber-700">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {issue.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleFixIssue(issue.id)}
                      className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                    >
                      Corriger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expert Mode Panel */}
      {config.isExpertMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">Mode Expert Activé</h3>
          <p className="text-sm text-blue-800 mb-3">
            Vous pouvez maintenant personnaliser chaque appareil individuellement. 
            Les modifications ne seront plus synchronisées automatiquement.
          </p>
          <div className="text-xs text-blue-700">
            💡 Basculez vers les onglets "Layout" et "Responsive" pour un contrôle granulaire.
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsivePanel;
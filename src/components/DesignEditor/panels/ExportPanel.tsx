import React, { useState } from 'react';
import { 
  Download, 
  Share, 
  Eye, 
  Smartphone,
  Monitor,
  Tablet,
  Link,
  Copy,
  Mail,
  ExternalLink
} from 'lucide-react';

const ExportPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preview');
  const [shareUrl] = useState('https://game.lovable.app/campaign/abc123');

  const exportFormats = [
    { id: 'png', label: 'PNG', desc: 'Image haute qualité' },
    { id: 'jpg', label: 'JPG', desc: 'Image compressée' },
    { id: 'pdf', label: 'PDF', desc: 'Document print' },
    { id: 'html', label: 'HTML', desc: 'Code embeddable' }
  ];

  const devices = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'tablet', label: 'Tablette', icon: Tablet },
    { id: 'desktop', label: 'Desktop', icon: Monitor }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Aperçu de publication</h4>
        
        {/* Device Selection */}
        <div className="flex space-x-2 mb-4">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-200 rounded-md hover:border-blue-300 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{device.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Window */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-32">
          <div className="text-center text-gray-500 text-sm">
            Aperçu de votre campagne
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <Eye className="w-4 h-4" />
        <span>Aperçu en plein écran</span>
      </button>
    </div>
  );

  const renderPublish = () => (
    <div className="space-y-4">
      {/* URL de partage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lien de partage
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
          />
          <button
            onClick={() => copyToClipboard(shareUrl)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Copier le lien"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Options de partage */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <Link className="w-4 h-4 text-blue-600" />
          <span className="text-sm">Copier lien</span>
        </button>
        
        <button className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <Mail className="w-4 h-4 text-blue-600" />
          <span className="text-sm">Par email</span>
        </button>
      </div>

      {/* Paramètres de publication */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Paramètres</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Campagne active</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Tracking activé</span>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Page publique</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
        <ExternalLink className="w-4 h-4" />
        <span>Publier la campagne</span>
      </button>
    </div>
  );

  const renderExport = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Formats d'export</h4>
        <div className="space-y-2">
          {exportFormats.map((format) => (
            <button
              key={format.id}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-800">{format.label}</div>
                <div className="text-xs text-gray-500">{format.desc}</div>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Options d'export */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Options</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Qualité</label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option>Haute (300 DPI)</option>
              <option>Moyenne (150 DPI)</option>
              <option>Web (72 DPI)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Dimensions</label>
            <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
              <option>Original</option>
              <option>1920x1080</option>
              <option>1080x1080</option>
              <option>1080x1920</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'preview', label: 'Aperçu', icon: Eye },
    { id: 'publish', label: 'Publier', icon: Share },
    { id: 'export', label: 'Exporter', icon: Download }
  ];

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'preview' && renderPreview()}
      {activeTab === 'publish' && renderPublish()}
      {activeTab === 'export' && renderExport()}
    </div>
  );
};

export default ExportPanel;
import React from 'react';
import PreviewCanvas from './components/PreviewCanvas';

interface ModernMobileTabProps {
  campaign: any;
}

const ModernMobileTab: React.FC<ModernMobileTabProps> = ({ campaign }) => {
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('mobile');

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Configuration mobile</h2>
          <p className="text-gray-600 text-sm">Aperçu et adaptation par appareil</p>
        </div>
        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button
            className={`px-3 py-1.5 text-sm ${device === 'desktop' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l border-gray-200 ${device === 'tablet' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setDevice('tablet')}
          >
            Tablet
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l border-gray-200 ${device === 'mobile' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setDevice('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="h-[520px]">
        <PreviewCanvas campaign={campaign} selectedDevice={device} />
      </div>
    </div>
  );
};

export default ModernMobileTab;

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GamePreview from '../components/GameEditor/GamePreview';
import type { DeviceType, EditorConfig } from '../components/GameEditor/GameEditorLayout';

const LivePreview: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const device = (query.get('device') as DeviceType) || 'desktop';
  const [config, setConfig] = useState<EditorConfig | null>(null);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    const param = query.get('config');
    if (param) {
      try {
        setConfig(JSON.parse(decodeURIComponent(param)));
        return;
      } catch {
        // Fallback to localStorage below
      }
    }

    const stored = localStorage.getItem('qualifio_live_preview_config');
    if (stored) {
      setConfig(JSON.parse(stored));
    } else {
      setLoadingError(true);
    }
  }, []);

  if (loadingError) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-center p-4">
          L&apos;aperçu live doit être ouvert depuis l&apos;éditeur.
        </p>
      </div>
    );
  }

  if (!config) return null;

  const isMode2 = config.displayMode === 'mode2-background';

  return (
    <div className={isMode2 ? "w-screen h-screen overflow-hidden" : "bg-gray-100 min-h-screen"}>
      <GamePreview device={device} config={config} isLivePreview={true} />
    </div>
  );
};

export default LivePreview;

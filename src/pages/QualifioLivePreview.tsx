import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import QualifioPreview from '../components/QualifioEditor/QualifioPreview';
import type { DeviceType, EditorConfig } from '../components/QualifioEditor/QualifioEditorLayout';

const QualifioLivePreview: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const device = (query.get('device') as DeviceType) || 'desktop';
  const [config, setConfig] = useState<EditorConfig | null>(null);

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
    }
  }, []);

  if (!config) return null;

  return (
    <div className="bg-gray-100 min-h-screen">
      <QualifioPreview device={device} config={config} />
    </div>
  );
};

export default QualifioLivePreview;

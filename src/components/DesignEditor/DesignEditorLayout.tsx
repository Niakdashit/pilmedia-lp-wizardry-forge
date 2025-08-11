
import React, { useState, useEffect } from 'react';
import { useDesignEditor } from './hooks/useDesignEditor';
import DesignEditorSidebar from './DesignEditorSidebar';
import DesignCanvas from './DesignCanvas';
import MobileOptimizedDesignEditor from './MobileOptimizedDesignEditor';
import { isRealMobile } from '../../utils/isRealMobile';

const DesignEditorLayout: React.FC = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const {
    campaign,
    setCampaign,
    selectedElementId,
    setSelectedElementId,
    zoom,
    setZoom
  } = useDesignEditor();

  // Detect real mobile device
  useEffect(() => {
    const checkDevice = () => {
      const isRealMobileDevice = isRealMobile();
      const isMobileViewport = window.innerWidth <= 768;
      
      setIsMobileDevice(isRealMobileDevice || isMobileViewport);
      
      if (isRealMobileDevice || isMobileViewport) {
        setSelectedDevice('mobile');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Force mobile interface for real mobile devices
  if (isMobileDevice || selectedDevice === 'mobile' || selectedDevice === 'tablet') {
    return (
      <MobileOptimizedDesignEditor 
        selectedDevice={selectedDevice as 'mobile' | 'tablet'}
      />
    );
  }

  // Desktop interface
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
        <DesignEditorSidebar
          selectedDevice={selectedDevice}
          onDeviceChange={setSelectedDevice}
          campaign={campaign}
          setCampaign={setCampaign}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DesignCanvas
          selectedDevice={selectedDevice}
          campaign={campaign}
          setCampaign={setCampaign}
          zoom={zoom}
          setZoom={setZoom}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          isMobileOptimized={false}
        />
      </div>
    </div>
  );
};

export default DesignEditorLayout;

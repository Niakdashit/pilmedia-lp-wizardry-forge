import React, { useState, useEffect } from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';
import CanvaMobileLayout from '../components/DesignEditor/CanvaMobileLayout';

const DesignEditor: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sur mobile, utiliser la layout Canva-style
  if (isMobile) {
    return (
      <CanvaMobileLayout 
        previewDevice={previewDevice}
        onDeviceChange={setPreviewDevice}
      >
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Design Canvas</h2>
            <p className="text-gray-600">Votre zone de design apparaît ici</p>
          </div>
        </div>
      </CanvaMobileLayout>
    );
  }

  return <DesignEditorLayout />;
};

export default DesignEditor;
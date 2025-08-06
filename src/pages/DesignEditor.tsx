import React, { useState, useEffect } from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';
import MobileDesignEditor from '../components/DesignEditor/MobileDesignEditor';

const DesignEditor: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileDesignEditor previewDevice={previewDevice} />;
  }

  return <DesignEditorLayout />;
};

export default DesignEditor;
import React, { useState, useEffect } from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';
import MobileCanvaDesignEditor from '../components/DesignEditor/MobileCanvaDesignEditor';

const DesignEditor: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isMobile) {
    return <MobileCanvaDesignEditor />;
  }

  return <DesignEditorLayout />;
};

export default DesignEditor;
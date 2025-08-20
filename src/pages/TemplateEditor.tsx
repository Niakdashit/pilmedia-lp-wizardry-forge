import React, { useEffect } from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';

const TemplateEditor: React.FC = () => {
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#f3f4f6';
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  return <DesignEditorLayout mode="template" />;
};

export default TemplateEditor;

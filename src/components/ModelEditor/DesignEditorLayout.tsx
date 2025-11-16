import React from 'react';

interface DesignEditorLayoutProps {
  mode?: string;
}

const DesignEditorLayout: React.FC<DesignEditorLayoutProps> = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-lg font-semibold">Model Editor</h1>
        <p className="text-sm opacity-70">Ce module est en cours d'intégration.</p>
      </div>
    </div>
  );
};

export default DesignEditorLayout;

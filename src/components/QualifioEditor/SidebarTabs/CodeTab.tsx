
import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface CodeTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const CodeTab: React.FC<CodeTabProps> = ({ config, onConfigUpdate }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">CSS personnalisé</h3>
        <textarea
          value={config.customCSS || ''}
          onChange={(e) => onConfigUpdate({ customCSS: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
          rows={6}
          placeholder="/* Votre CSS personnalisé */"
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">JavaScript personnalisé</h3>
        <textarea
          value={config.customJS || ''}
          onChange={(e) => onConfigUpdate({ customJS: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
          rows={6}
          placeholder="// Votre JavaScript personnalisé"
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Tags de tracking</h3>
        <textarea
          value={config.trackingTags || ''}
          onChange={(e) => onConfigUpdate({ trackingTags: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
          rows={4}
          placeholder="<!-- Vos tags de tracking -->"
        />
      </div>
    </div>
  );
};

export default CodeTab;

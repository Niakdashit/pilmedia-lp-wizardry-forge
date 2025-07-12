import React from 'react';
import type { EditorConfig } from '../QualifioEditorLayout';

interface CodeTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const CodeTab: React.FC<CodeTabProps> = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code personnalisé et tags</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS personnalisé
            </label>
            <textarea
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              placeholder="/* Ajoutez votre CSS personnalisé ici */"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JavaScript personnalisé
            </label>
            <textarea
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              placeholder="// Ajoutez votre JavaScript personnalisé ici"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags de tracking
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              placeholder="<!-- Ajoutez vos tags de tracking ici -->"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeTab;
import React from 'react';
import { DeviceType, EditorConfig } from './GameEditorLayout';

interface EditorSidebarProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  config,
  onConfigUpdate,
  device,
  onDeviceChange,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
  lastSaved
}) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Editor</h2>
      
      <div className="space-y-4">
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        <button 
          onClick={onPublish}
          disabled={isPublishing}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </button>
        
        {lastSaved && (
          <p className="text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
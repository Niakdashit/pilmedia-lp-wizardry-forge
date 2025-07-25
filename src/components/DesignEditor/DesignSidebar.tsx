import React, { useState } from 'react';
import { Layers, Upload, Type, Square, Palette, Image, Move3D, Undo, Redo } from 'lucide-react';

interface DesignSidebarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const [activeTab, setActiveTab] = useState('elements');

  const tabs = [
    { id: 'design', label: 'Design', icon: Square },
    { id: 'elements', label: 'Elements', icon: Layers },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'brand', label: 'Brand', icon: Palette },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'tools', label: 'Tools', icon: Move3D },
    { id: 'background', label: 'Projects', icon: Image }
  ];

  return (
    <div className="w-20 bg-slate-700 flex flex-col items-center py-6 space-y-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
              isActive
                ? 'bg-white text-slate-700'
                : 'text-gray-300 hover:text-white hover:bg-slate-600'
            }`}
            title={tab.label}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
      
      {/* History controls at bottom */}
      <div className="mt-auto space-y-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            canUndo 
              ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title="Annuler"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            canRedo 
              ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
              : 'text-gray-500 cursor-not-allowed'
          }`}
          title="Rétablir"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DesignSidebar;
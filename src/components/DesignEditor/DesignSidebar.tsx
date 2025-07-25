import React from 'react';
import { 
  Palette, 
  Type, 
  Shapes, 
  Upload, 
  Wrench, 
  FolderOpen,
  Grid3X3,
  Star
} from 'lucide-react';
import DesignPanel from './panels/DesignPanel';
import ElementsPanel from './panels/ElementsPanel';
import TextPanel from './panels/TextPanel';
import BrandPanel from './panels/BrandPanel';
import UploadsPanel from './panels/UploadsPanel';

interface DesignSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddElement: (element: any) => void;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  activeTab,
  onTabChange,
  onAddElement
}) => {
  const tabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'elements', label: 'Éléments', icon: Shapes },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'brand', label: 'Marque', icon: Star },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'tools', label: 'Outils', icon: Wrench },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'apps', label: 'Apps', icon: Grid3X3 },
  ];

  const renderPanel = () => {
    switch (activeTab) {
      case 'design':
        return <DesignPanel onAddElement={onAddElement} />;
      case 'elements':
        return <ElementsPanel onAddElement={onAddElement} />;
      case 'text':
        return <TextPanel onAddElement={onAddElement} />;
      case 'brand':
        return <BrandPanel onAddElement={onAddElement} />;
      case 'uploads':
        return <UploadsPanel onAddElement={onAddElement} />;
      default:
        return <div className="p-4 text-gray-500">Panel à venir...</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex">
      {/* Tab Navigation */}
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={tab.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            {tabs.find(tab => tab.id === activeTab)?.label}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;
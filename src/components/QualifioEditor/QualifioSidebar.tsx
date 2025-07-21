
import React from 'react';
import { Settings, Palette, Type, Layers, Layout, CheckCircle, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';

interface QualifioSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const QualifioSidebar: React.FC<QualifioSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const tabs = [
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'texts', label: 'Textes', icon: Type },
    { id: 'layers', label: 'Calques', icon: Layers },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'animations', label: 'Animations', icon: Wand2 },
    { id: 'finalization', label: 'Finalisation', icon: CheckCircle }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-20'}`}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Tabs */}
      <nav className="py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full p-4 flex flex-col items-center gap-2 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-brand-primary bg-brand-accent/20'
                  : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
              }`}
              title={isCollapsed ? tab.label : undefined}
            >
              <Icon className="w-6 h-6" />
              {!isCollapsed && (
                <span className="text-xs font-medium text-center leading-tight">
                  {tab.label}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-primary rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default QualifioSidebar;

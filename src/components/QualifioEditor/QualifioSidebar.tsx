
import React from 'react';
import { Settings, Palette, Layout, Check, ChevronLeft, ChevronRight, Layers, Shapes } from 'lucide-react';

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
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
      description: 'Type de jeu et paramètres'
    },
    {
      id: 'elements',
      label: 'Bibliothèque',
      icon: Shapes,
      description: 'Formes, icônes, photos et plus'
    },
    {
      id: 'design',
      label: 'Design & Contenu',
      icon: Palette,
      description: 'Images, textes et couleurs'
    },
    {
      id: 'layers',
      label: 'Éléments',
      icon: Layers,
      description: 'Gestion des couches et éléments'
    },
    {
      id: 'layout',
      label: 'Layout & Responsive',
      icon: Layout,
      description: 'Positionnement et adaptation'
    },
    {
      id: 'finalization',
      label: 'Finalisation',
      icon: Check,
      description: 'Boutons, formulaire et code'
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-20'} sidebar-premium flex flex-col border-r border-gray-200 transition-all duration-300 bg-white`} style={{ height: 'calc(100vh - 88px)' }}>
      {/* Toggle button */}
      <div className="flex justify-end p-2 border-b border-gray-100">
        <button 
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation des onglets - Layout vertical */}
      <div className="flex flex-col p-3 space-y-3 overflow-y-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div key={tab.id} className="relative group">
              <button 
                onClick={() => onTabChange(tab.id)} 
                className={`${isCollapsed ? 'w-10 h-10' : 'w-14 h-14'} rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                }`}
                title={isCollapsed ? tab.label : undefined}
              >
                <Icon className={`${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'}`} />
                {!isCollapsed && (
                  <span className="text-[9px] leading-tight text-center mt-0.5 max-w-full break-words">
                    {tab.label}
                  </span>
                )}
              </button>
              
              {/* Enhanced tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QualifioSidebar;

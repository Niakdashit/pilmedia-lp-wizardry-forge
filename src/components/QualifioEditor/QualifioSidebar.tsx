import React from 'react';
import { Settings, Image, Type, MousePointer, Code, FileText, Gamepad2, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const tabs = [{
    id: 'general',
    label: 'Général',
    icon: Settings
  }, {
    id: 'design',
    label: 'Design',
    icon: Palette
  }, {
    id: 'gameZone',
    label: 'Zone de jeu',
    icon: Image
  }, {
    id: 'gameMechanics',
    label: 'Mécaniques',
    icon: Gamepad2
  }, {
    id: 'texts',
    label: 'Textes',
    icon: Type
  }, {
    id: 'buttons',
    label: 'Boutons',
    icon: MousePointer
  }, {
    id: 'form',
    label: 'Formulaire',
    icon: FileText
  }, {
    id: 'code',
    label: 'Code personnalisé et tags',
    icon: Code
  }];
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
            <button 
              key={tab.id} 
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
          );
        })}
      </div>
    </div>
  );
};
export default QualifioSidebar;
import React from 'react';
import { Settings, Image, Type, MousePointer, Code, FileText, Gamepad2, Palette } from 'lucide-react';
interface QualifioSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const QualifioSidebar: React.FC<QualifioSidebarProps> = ({
  activeTab,
  onTabChange
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
  return <div className="w-20 sidebar-premium flex flex-col h-screen border-r border-gray-200">
      {/* Navigation des onglets - Layout vertical */}
      <div className="flex flex-col p-2 space-y-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => onTabChange(tab.id)} 
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>;
};
export default QualifioSidebar;
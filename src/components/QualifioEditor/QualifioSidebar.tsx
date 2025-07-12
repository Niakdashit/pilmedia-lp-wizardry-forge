import React from 'react';
import { Settings, Gamepad2, Type, MousePointer, Code2, X } from 'lucide-react';
import QualifioGeneralTab from './tabs/QualifioGeneralTab';
import QualifioGameTab from './tabs/QualifioGameTab';
import QualifioTextTab from './tabs/QualifioTextTab';
import QualifioButtonTab from './tabs/QualifioButtonTab';
import QualifioCodeTab from './tabs/QualifioCodeTab';

interface QualifioSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  campaign: any;
  setCampaign: (campaign: any) => void;
}

const QualifioSidebar: React.FC<QualifioSidebarProps> = ({
  activeTab,
  onTabChange,
  campaign,
  setCampaign
}) => {
  const tabs = [
    {
      id: 'general',
      label: 'Général',
      icon: Settings,
      component: QualifioGeneralTab
    },
    {
      id: 'game',
      label: 'Zone de jeu',
      icon: Gamepad2,
      component: QualifioGameTab
    },
    {
      id: 'text',
      label: 'Textes',
      icon: Type,
      component: QualifioTextTab
    },
    {
      id: 'buttons',
      label: 'Boutons',
      icon: MousePointer,
      component: QualifioButtonTab
    },
    {
      id: 'code',
      label: 'Code personnalisé et tags',
      icon: Code2,
      component: QualifioCodeTab
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveTabComponent = activeTabData?.component;

  return (
    <div className="w-96 bg-slate-700 flex flex-col">
      {/* Navigation des onglets */}
      <div className="border-b border-gray-200">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 border-b border-gray-600 hover:bg-slate-600 transition-colors ${
                isActive ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 overflow-y-auto bg-white">
        {ActiveTabComponent && (
          <ActiveTabComponent
            campaign={campaign}
            setCampaign={setCampaign}
          />
        )}
      </div>

      {/* Bouton Annuler */}
      <div className="bg-white border-t border-gray-200 p-4">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">Annuler</span>
        </button>
      </div>
    </div>
  );
};

export default QualifioSidebar;
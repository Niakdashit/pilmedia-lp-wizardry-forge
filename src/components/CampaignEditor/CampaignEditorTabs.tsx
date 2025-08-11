
import React from 'react';

interface CampaignEditorTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CampaignEditorTabs: React.FC<CampaignEditorTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'content', label: 'Design & Contenu', icon: '🎨' },
    { id: 'mobile', label: 'Mobile', icon: '📱' },    
    { id: 'screens', label: 'Écrans', icon: '📱' },
    { id: 'form', label: 'Formulaire', icon: '📝' },
    { id: 'participations', label: 'Participations', icon: '👥' },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="overflow-x-auto scrollbar-hide px-2 sm:px-6">
        <div className="flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-[#841b60] text-[#841b60]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CampaignEditorTabs;

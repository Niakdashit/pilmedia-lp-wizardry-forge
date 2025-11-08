
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Gamepad2, Palette, FormInput, Sliders, Smartphone } from 'lucide-react';
import { CampaignType } from '../../utils/campaignTypes';

interface ModernEditorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  campaignType: CampaignType;
}

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  description?: string;
}

const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: TabConfig[] = [
    { id: 'general', label: 'Général', icon: Settings, description: 'Informations de base' },
    { id: 'game', label: 'Jeu', icon: Gamepad2, description: 'Configuration du jeu' },
    { id: 'gameconfig', label: 'Layout', icon: Sliders, description: 'Taille et position' },
    { id: 'design', label: 'Design', icon: Palette, description: 'Couleurs et style' },
    { id: 'form', label: 'Formulaire', icon: FormInput, description: 'Champs de saisie' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Vue mobile' }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50/50 flex flex-col py-4">
      <div className="flex-1 space-y-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => onTabChange(tab.id)}
                className={`relative w-full flex flex-col items-center p-3 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#E0004D] to-[#4D2388] text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              
              {/* Enhanced tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                <div className="font-semibold">{tab.label}</div>
                {tab.description && (
                  <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                )}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom gradient */}
      <div className="px-3 pb-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E0004D]/30 to-transparent"></div>
      </div>
    </div>
  );
};

export default ModernEditorSidebar;

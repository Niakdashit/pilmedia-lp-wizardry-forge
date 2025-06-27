
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
  priority: number;
}

const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  // Nouvelle organisation logique selon le workflow de création
  const tabs: TabConfig[] = [
    { id: 'game', label: 'Jeu', icon: Gamepad2, description: 'Configuration du jeu', priority: 1 },
    { id: 'design', label: 'Apparence', icon: Palette, description: 'Couleurs et style', priority: 2 },
    { id: 'gameconfig', label: 'Placement', icon: Sliders, description: 'Taille et position', priority: 3 },
    { id: 'form', label: 'Interaction', icon: FormInput, description: 'Formulaires et textes', priority: 4 },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Adaptations mobiles', priority: 5 },
    { id: 'general', label: 'Général', icon: Settings, description: 'Paramètres globaux', priority: 6 }
  ];

  // Trier par priorité pour assurer l'ordre logique
  const sortedTabs = tabs.sort((a, b) => a.priority - b.priority);

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50/50 flex flex-col py-4">
      {/* Header avec indicateur de progression */}
      <div className="px-2 mb-4">
        <div className="text-xs font-medium text-gray-500 mb-2">Configuration</div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-[#841b60] to-[#6d164f] h-1 rounded-full transition-all duration-300"
            style={{ width: `${((sortedTabs.findIndex(t => t.id === activeTab) + 1) / sortedTabs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-2 px-2">
        {sortedTabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCompleted = index < sortedTabs.findIndex(t => t.id === activeTab);
          
          return (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => onTabChange(tab.id)}
                className={`relative w-full flex flex-col items-center p-3 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg transform scale-105' 
                    : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md'
                }`}
              >
                {/* Numéro de priorité */}
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : isCompleted
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : tab.priority}
                </div>

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
                <div className="text-xs text-gray-400 mt-1">Étape {tab.priority}</div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom gradient avec info */}
      <div className="px-3 pb-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#841b60]/30 to-transparent mb-2"></div>
        <div className="text-xs text-center text-gray-500">
          Workflow optimisé
        </div>
      </div>
    </div>
  );
};

export default ModernEditorSidebar;

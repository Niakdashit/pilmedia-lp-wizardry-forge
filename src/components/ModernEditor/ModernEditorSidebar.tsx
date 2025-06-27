
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
  description: string;
  priority: number;
  category: 'primary' | 'secondary';
}

const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  // Organisation logique selon le workflow utilisateur réel
  const tabs: TabConfig[] = [
    // Étapes principales du workflow
    { 
      id: 'game', 
      label: 'Jeu', 
      icon: Gamepad2, 
      description: 'Segments, règles, comportement', 
      priority: 1,
      category: 'primary'
    },
    { 
      id: 'design', 
      label: 'Style', 
      icon: Palette, 
      description: 'Couleurs, thème, apparence', 
      priority: 2,
      category: 'primary'
    },
    { 
      id: 'gameconfig', 
      label: 'Placement', 
      icon: Sliders, 
      description: 'Taille, position, responsive', 
      priority: 3,
      category: 'primary'
    },
    
    // Étapes secondaires
    { 
      id: 'form', 
      label: 'Interaction', 
      icon: FormInput, 
      description: 'Formulaires, textes, boutons', 
      priority: 4,
      category: 'secondary'
    },
    { 
      id: 'mobile', 
      label: 'Mobile', 
      icon: Smartphone, 
      description: 'Adaptations mobiles', 
      priority: 5,
      category: 'secondary'
    },
    { 
      id: 'general', 
      label: 'Paramètres', 
      icon: Settings, 
      description: 'Configuration générale', 
      priority: 6,
      category: 'secondary'
    }
  ];

  // Séparer les onglets par catégorie
  const primaryTabs = tabs.filter(tab => tab.category === 'primary');
  const secondaryTabs = tabs.filter(tab => tab.category === 'secondary');

  const renderTabButton = (tab: TabConfig, index: number, totalInCategory: number) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    const isCompleted = tab.priority < (tabs.find(t => t.id === activeTab)?.priority || 1);
    
    return (
      <div key={tab.id} className="relative group">
        <button
          onClick={() => onTabChange(tab.id)}
          className={`relative w-full flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
            isActive 
              ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg scale-105' 
              : isCompleted
              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md border border-gray-100'
          }`}
        >
          {/* Indicateur de priorité */}
          <div className={`absolute top-2 left-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
            isActive 
              ? 'bg-white/20 text-white' 
              : isCompleted
              ? 'bg-green-200 text-green-800'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {isCompleted ? '✓' : tab.priority}
          </div>

          <Icon className={`w-6 h-6 mb-2 transition-transform duration-300 ${
            isActive ? 'scale-110' : 'group-hover:scale-105'
          }`} />
          
          <span className="text-sm font-medium text-center leading-tight mb-1">{tab.label}</span>
          
          <span className={`text-xs text-center leading-tight opacity-80 ${
            isActive ? 'text-white/80' : 'text-gray-500'
          }`}>
            {tab.description.split(',')[0]}
          </span>
          
          {/* Indicateur d'onglet actif */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-white rounded-r-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        
        {/* Tooltip amélioré */}
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 px-4 py-3 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-xl">
          <div className="font-semibold">{tab.label}</div>
          <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
          <div className="text-xs text-gray-400 mt-1">
            {tab.category === 'primary' ? 'Essentiel' : 'Avancé'} • Étape {tab.priority}
          </div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-white to-gray-50/50 flex flex-col py-6">
      {/* Header avec progression */}
      <div className="px-4 mb-6">
        <div className="text-xs font-medium text-gray-500 mb-2">Configuration</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#841b60] to-[#6d164f] h-2 rounded-full transition-all duration-500 relative"
            style={{ 
              width: `${((tabs.findIndex(t => t.id === activeTab) + 1) / tabs.length) * 100}%` 
            }}
          >
            <div className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full transform translate-x-1"></div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          Étape {tabs.find(t => t.id === activeTab)?.priority || 1} sur {tabs.length}
        </div>
      </div>

      <div className="flex-1 px-3 space-y-6">
        {/* Onglets principaux */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3">
            🎯 Configuration essentielle
          </div>
          {primaryTabs.map((tab, index) => renderTabButton(tab, index, primaryTabs.length))}
        </div>

        {/* Séparateur */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Onglets secondaires */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3">
            ⚙️ Configuration avancée
          </div>
          {secondaryTabs.map((tab, index) => renderTabButton(tab, index, secondaryTabs.length))}
        </div>
      </div>
      
      {/* Footer avec info workflow */}
      <div className="px-4 pt-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#841b60]/30 to-transparent mb-3"></div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Workflow optimisé</div>
          <div className="text-xs text-gray-400">Configuration en 6 étapes</div>
        </div>
      </div>
    </div>
  );
};

export default ModernEditorSidebar;

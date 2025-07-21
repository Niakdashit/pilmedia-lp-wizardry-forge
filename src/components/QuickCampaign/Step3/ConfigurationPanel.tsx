
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Palette, Sparkles, Crown, ChevronDown, ChevronRight, Layout } from 'lucide-react';
import GameConfigSelector from './GameConfigs/GameConfigSelector';
import ButtonStyleSelector from './ButtonStyleSelector';
import GamePositionSelector from './GamePositionSelector';
import AdvancedModeToggle from './AdvancedModeToggle';
import AdvancedWheelCustomization from './AdvancedWheelCustomization';
import WheelRenderingEffects from './WheelRenderingEffects';
import MonetizationFeatures from './MonetizationFeatures';
import ProExtensions from './ProExtensions';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import ColorCustomizer from '../ColorCustomizer';

const ConfigurationPanel: React.FC = () => {
  const { advancedMode } = useQuickCampaignStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['gameConfig', 'colors'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const configSections = [
    {
      id: 'gameConfig',
      title: 'Configuration du jeu',
      icon: Settings,
      color: 'bg-blue-500',
      bgColor: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      component: <GameConfigSelector />
    },
    {
      id: 'colors',
      title: 'Couleurs et thème',
      icon: Palette,
      color: 'bg-indigo-500',
      bgColor: 'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200',
      component: <ColorCustomizer />
    },
    {
      id: 'buttonStyle',
      title: 'Style du bouton',
      icon: Sparkles,
      color: 'bg-purple-500',
      bgColor: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      component: <ButtonStyleSelector />
    },
    {
      id: 'gamePosition',
      title: 'Position du jeu',
      icon: Layout,
      color: 'bg-green-500',
      bgColor: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      component: <GamePositionSelector />
    }
  ];

  const advancedSections = [
    {
      id: 'wheelCustomization',
      title: 'Personnalisation avancée',
      icon: Sparkles,
      color: 'bg-pink-500',
      bgColor: 'from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200',
      component: <AdvancedWheelCustomization />
    },
    {
      id: 'renderingEffects',
      title: 'Effets de rendu',
      icon: Sparkles,
      color: 'bg-orange-500',
      bgColor: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
      component: <WheelRenderingEffects />
    },
    {
      id: 'monetization',
      title: 'Monétisation',
      icon: Crown,
      color: 'bg-yellow-500',
      bgColor: 'from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200',
      component: <MonetizationFeatures />
    },
    {
      id: 'extensions',
      title: 'Extensions Pro',
      icon: Crown,
      color: 'bg-red-500',
      bgColor: 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200',
      component: <ProExtensions />
    }
  ];

  const allSections = [...configSections, ...(advancedMode ? advancedSections : [])];

  return (
    <div className="col-span-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Configuration</h2>
              <p className="text-xs text-gray-600">Personnalisez votre campagne</p>
            </div>
          </div>
          <AdvancedModeToggle />
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
        <div className="p-4 space-y-3">
          {allSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-3 py-2 flex items-center justify-between bg-gradient-to-r hover:shadow-md transition-all duration-200 ${section.bgColor}`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${section.color}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white border-t border-gray-100">
                        {section.component}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;

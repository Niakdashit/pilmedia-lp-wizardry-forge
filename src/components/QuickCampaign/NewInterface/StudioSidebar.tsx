
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Gamepad2, 
  Palette, 
  Image, 
  Type,
  Sparkles
} from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import GameTypeSelector from './panels/GameTypePanel';
import BrandAssetsPanel from './panels/BrandAssetsPanel';
import ColorCustomizationPanel from './panels/ColorCustomizationPanel';
import TypographyPanel from './panels/TypographyPanel';

interface StudioSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const StudioSidebar: React.FC<StudioSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const [activePanel, setActivePanel] = useState<string>('game');
  const { campaignName, setCampaignName, selectedGameType } = useQuickCampaignStore();

  const panels = [
    {
      id: 'game',
      title: 'Type de jeu',
      icon: Gamepad2,
      description: 'Choisir l\'expérience',
      component: GameTypeSelector,
      completed: !!selectedGameType
    },
    {
      id: 'brand',
      title: 'Assets de marque',
      icon: Image,
      description: 'Logo & visuels',
      component: BrandAssetsPanel,
      completed: false
    },
    {
      id: 'colors',
      title: 'Couleurs',
      icon: Palette,
      description: 'Palette de marque',
      component: ColorCustomizationPanel,
      completed: false
    },
    {
      id: 'typography',
      title: 'Typographie',
      icon: Type,
      description: 'Polices & textes',
      component: TypographyPanel,
      completed: false
    }
  ];

  const ActivePanelComponent = panels.find(p => p.id === activePanel)?.component;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Studio</h1>
                <p className="text-sm text-muted-foreground">Quick Campaign</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Campaign Name Input */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Nom de la campagne..."
              className="w-full px-4 py-3 bg-muted border border-transparent rounded-xl focus:border-primary focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
            />
          </motion.div>
        )}
      </div>

      {/* Panel Navigation */}
      <div className="flex-1 flex flex-col">
        {!collapsed ? (
          <>
            {/* Panel Tabs */}
            <div className="px-4 py-4 border-b border-border">
              <div className="space-y-2">
                {panels.map((panel) => {
                  const Icon = panel.icon;
                  return (
                    <button
                      key={panel.id}
                      onClick={() => setActivePanel(panel.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-left ${
                        activePanel === panel.id
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{panel.title}</div>
                        <div className={`text-xs truncate ${
                          activePanel === panel.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {panel.description}
                        </div>
                      </div>
                      {panel.completed && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  {ActivePanelComponent && <ActivePanelComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Collapsed Mini Navigation */
          <div className="px-2 py-4 space-y-2">
            {panels.map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  onClick={() => {
                    setActivePanel(panel.id);
                    onToggleCollapse();
                  }}
                  className={`w-full p-3 rounded-xl transition-all relative ${
                    activePanel === panel.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  title={panel.title}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  {panel.completed && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioSidebar;

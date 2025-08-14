
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import ModernEditorSidebar from '../ModernEditorSidebar';
import ModernEditorPanel from '../ModernEditorPanel';
import { CampaignType } from '../../../utils/campaignTypes';

interface EditorDesktopPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  campaignType: CampaignType;
}

const EditorDesktopPanel: React.FC<EditorDesktopPanelProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  campaign,
  setCampaign,
  campaignType
}) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden md:flex md:w-80 lg:w-96 xl:w-[420px] bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl z-40 h-full overflow-y-auto relative"
        >
          {/* Panel collapse button - desktop only */}
          <button
            onClick={onToggle}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors z-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex h-full min-w-0">
            {/* Sidebar tabs */}
            <div className="w-20 flex-shrink-0 border-r border-gray-200/50">
              <ModernEditorSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                campaignType={campaignType}
              />
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto min-w-0">
              <ModernEditorPanel
                activeStep={activeTab}
                campaign={campaign}
                setCampaign={setCampaign}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditorDesktopPanel;

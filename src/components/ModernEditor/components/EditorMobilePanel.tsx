
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ModernEditorSidebar from '../ModernEditorSidebar';
import ModernEditorPanel from '../ModernEditorPanel';
import { CampaignType } from '../../../utils/campaignTypes';

interface EditorMobilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  campaignType: CampaignType;
}

const EditorMobilePanel: React.FC<EditorMobilePanelProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  campaign,
  setCampaign,
  campaignType
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile panel */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 w-full max-w-full sm:max-w-md bg-white/95 backdrop-blur-md border-r border-gray-200/50 shadow-xl z-40 h-full overflow-y-auto relative md:hidden"
          >
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl z-50"
            >
              <X className="w-5 h-5" />
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
    </>
  );
};

export default EditorMobilePanel;

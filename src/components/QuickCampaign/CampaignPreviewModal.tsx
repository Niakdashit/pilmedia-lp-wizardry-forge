
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import PreviewHeader from './Preview/PreviewHeader';
import PreviewContent from './Preview/PreviewContent';

interface CampaignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CampaignPreviewModal: React.FC<CampaignPreviewModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const { 
    generatePreviewCampaign, 
    campaignName, 
    selectedGameType,
    jackpotColors,
    customColors
  } = useQuickCampaignStore();

  if (!isOpen) return null;

  const mockCampaign = generatePreviewCampaign();


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full h-full flex flex-col relative overflow-hidden rounded-3xl shadow-2xl max-w-7xl max-h-[90vh]"
      >
        <PreviewHeader
          campaignName={campaignName}
          selectedGameType={selectedGameType || 'wheel'}
          selectedDevice={selectedDevice}
          onDeviceChange={setSelectedDevice}
          onClose={onClose}
        />

        <PreviewContent
          selectedDevice={selectedDevice}
          mockCampaign={mockCampaign}
          selectedGameType={selectedGameType || 'wheel'}
          customColors={customColors}
          jackpotColors={jackpotColors}
        />
      </motion.div>
    </div>
  );
};

export default CampaignPreviewModal;

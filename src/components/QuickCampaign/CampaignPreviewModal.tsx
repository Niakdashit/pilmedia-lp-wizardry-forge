
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import PreviewHeader from './Preview/PreviewHeader';
import PreviewContent from './Preview/PreviewContent';
import { getPreviewUrl, copyPreviewUrl } from '../../utils/previewUrl';

interface CampaignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
}

const CampaignPreviewModal: React.FC<CampaignPreviewModalProps> = ({
  isOpen,
  onClose,
  campaignId
}) => {
  const [selectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCopied, setIsCopied] = useState(false);
  
  const { 
    generatePreviewCampaign, 
    campaignName, 
    selectedGameType,
    jackpotColors,
    customColors
  } = useQuickCampaignStore();

  if (!isOpen) return null;

  const mockCampaign = generatePreviewCampaign();
  const previewUrl = campaignId ? getPreviewUrl(campaignId) : null;

  const handleCopyUrl = async () => {
    if (!campaignId) return;
    
    try {
      await copyPreviewUrl(campaignId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full h-full flex flex-col relative overflow-hidden rounded-3xl shadow-2xl max-w-7xl max-h-[90vh]"
        style={{
          ...(mockCampaign.type === 'quiz' && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })
        }}
      >
        <div className="border-b bg-white p-4">
          <PreviewHeader
            campaignName={campaignName}
            selectedGameType={selectedGameType || 'wheel'}
            onClose={onClose}
          />
          {previewUrl && (
            <div className="flex items-center gap-2 mt-2">
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                {previewUrl}
              </a>
              <button
                onClick={handleCopyUrl}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copier l'URL"
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>

        <div 
          className="flex-1 overflow-hidden"
          style={{
            ...(mockCampaign.type === 'quiz' && {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px'
            })
          }}
        >
          <PreviewContent
            selectedDevice={selectedDevice}
            mockCampaign={mockCampaign}
            selectedGameType={selectedGameType || 'wheel'}
            customColors={customColors}
            jackpotColors={jackpotColors}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignPreviewModal;

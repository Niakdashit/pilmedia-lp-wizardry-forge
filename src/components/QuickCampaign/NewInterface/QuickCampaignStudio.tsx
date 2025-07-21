
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import StudioSidebar from './StudioSidebar';
import StudioPreview from './StudioPreview';
import StudioFooter from './StudioFooter';
import { useBrandColorExtraction } from '../Preview/hooks/useBrandColorExtraction';

const QuickCampaignStudio: React.FC = () => {
  const { 
    customColors, 
    logoUrl, 
    campaignName,
    selectedGameType,
    generatePreviewCampaign 
  } = useQuickCampaignStore();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Extract brand colors for adaptive theming
  const { finalColors, brandStyleExtracted } = useBrandColorExtraction(customColors, logoUrl);
  
  // Auto-save mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      const storeState = useQuickCampaignStore.getState();
      localStorage.setItem('quickCampaignDraft', JSON.stringify({
        timestamp: Date.now(),
        data: {
          campaignName: storeState.campaignName,
          selectedGameType: storeState.selectedGameType,
          customColors: storeState.customColors,
          logoUrl: storeState.logoUrl,
          backgroundImageUrl: storeState.backgroundImageUrl
        }
      }));
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Dynamic theme CSS variables based on extracted colors
  const themeStyle = {
    '--studio-primary': finalColors.primary,
    '--studio-secondary': finalColors.secondary,
    '--studio-accent': finalColors.accent || '#ffffff',
    '--studio-surface': brandStyleExtracted 
      ? (isLightColor(finalColors.primary) ? '#ffffff' : '#1a1a1a')
      : '#ffffff',
    '--studio-text': brandStyleExtracted
      ? (isLightColor(finalColors.primary) ? '#1a1a1a' : '#ffffff')
      : '#1a1a1a'
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen bg-background transition-all duration-500"
      style={themeStyle}
    >
      {/* Studio Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Configuration Sidebar */}
        <motion.div
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-96'
          } bg-card border-r border-border flex-shrink-0`}
        >
          <StudioSidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </motion.div>

        {/* Central Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 relative"
          >
            <StudioPreview 
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
              themeColors={finalColors}
            />
          </motion.div>

          {/* Fixed Footer Actions */}
          <StudioFooter 
            onPublish={() => {
              // Handle direct publish
              console.log('Publishing campaign...', generatePreviewCampaign());
            }}
            onAdvancedMode={() => {
              // Transfer to campaign editor
              const campaignData = {
                selectedGameType,
                customColors: finalColors,
                campaignName,
                mockCampaign: generatePreviewCampaign()
              };
              localStorage.setItem('quickCampaignTransfer', JSON.stringify(campaignData));
              window.location.href = '/campaign-editor';
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to determine if a color is light
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

export default QuickCampaignStudio;

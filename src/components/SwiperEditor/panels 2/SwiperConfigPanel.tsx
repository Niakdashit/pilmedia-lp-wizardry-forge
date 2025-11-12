import React from 'react';
import AssetsPanel from './AssetsPanel';

interface SwiperConfigPanelProps {
  swiperConfig: any;
  onConfigChange: (config: any) => void;
}

const SwiperConfigPanel: React.FC<SwiperConfigPanelProps> = ({ swiperConfig, onConfigChange }) => {
  return (
    <div className="h-full overflow-y-auto">
      <AssetsPanel 
        swiperConfig={swiperConfig}
        onConfigChange={onConfigChange}
      />
    </div>
  );
};

export default SwiperConfigPanel;

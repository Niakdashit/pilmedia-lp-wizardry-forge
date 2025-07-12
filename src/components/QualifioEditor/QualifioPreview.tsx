import React from 'react';
import QualifioGameFrame from './QualifioGameFrame';

interface QualifioPreviewProps {
  campaign: any;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const QualifioPreview: React.FC<QualifioPreviewProps> = ({
  campaign,
  previewDevice
}) => {
  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      case 'desktop':
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className="flex-1 bg-slate-700 flex items-start justify-center p-8 overflow-auto">
      <div className={`${getDeviceClass()} w-full flex justify-center`}>
        <QualifioGameFrame
          campaign={campaign}
          previewDevice={previewDevice}
        />
      </div>
    </div>
  );
};

export default QualifioPreview;
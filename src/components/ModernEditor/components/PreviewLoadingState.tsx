import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface PreviewLoadingStateProps {
  device: 'desktop' | 'tablet' | 'mobile';
  message?: string;
  showIcon?: boolean;
}

const PreviewLoadingState: React.FC<PreviewLoadingStateProps> = ({
  device,
  message = 'Chargement du preview...',
  showIcon = true
}) => {
  const getDeviceIcon = () => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-8 h-8 text-gray-400" />;
      case 'tablet': return <Tablet className="w-8 h-8 text-gray-400" />;
      default: return <Monitor className="w-8 h-8 text-gray-400" />;
    }
  };

  const getSkeletonClasses = () => {
    switch (device) {
      case 'mobile':
        return 'w-[260px] h-[550px] bg-gray-100 rounded-[2rem] p-2 shadow';
      case 'tablet':
        return 'w-[340px] h-[480px] bg-gray-100 rounded-xl p-3 shadow';
      default:
        return 'w-full h-full bg-white rounded-xl shadow border border-gray-200';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Static device frame (no loading animation) */}
        <div className={`${getSkeletonClasses()} flex items-center justify-center mx-auto`}>
          <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
            {showIcon && getDeviceIcon()}
          </div>
        </div>
        
        {/* Static message (no spinner or pulse) */}
        <div className="space-y-1">
          <div className="flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewLoadingState;
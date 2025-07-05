import React from 'react';
import { Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';

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
        return 'w-[260px] h-[550px] bg-gray-900 rounded-[2rem] p-2 shadow-2xl';
      case 'tablet':
        return 'w-[340px] h-[480px] bg-gray-800 rounded-xl p-3 shadow-2xl';
      default:
        return 'w-full h-full bg-white rounded-xl shadow-lg border border-gray-200';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-6">
        {/* Device Skeleton */}
        <div className={`${getSkeletonClasses()} flex items-center justify-center mx-auto animate-pulse`}>
          <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
            {showIcon && getDeviceIcon()}
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            <span className="text-gray-600 text-sm font-medium">{message}</span>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewLoadingState;
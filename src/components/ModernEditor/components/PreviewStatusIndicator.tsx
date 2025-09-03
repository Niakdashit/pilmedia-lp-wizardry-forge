import React from 'react';
import { Activity, Zap, Clock, CheckCircle2 } from 'lucide-react';

interface PreviewStatusIndicatorProps {
  status: 'idle' | 'loading' | 'playing' | 'completed' | 'error';
  device: 'desktop' | 'tablet' | 'mobile';
  progress?: number; // 0-100
  message?: string;
}

const PreviewStatusIndicator: React.FC<PreviewStatusIndicatorProps> = ({
  status,
  device,
  progress = 0,
  message
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Activity className="w-3 h-3" />;
      case 'playing':
        return <Zap className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'error':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-500/90 text-white';
      case 'playing':
        return 'bg-green-500/90 text-white';
      case 'completed':
        return 'bg-emerald-500/90 text-white';
      case 'error':
        return 'bg-red-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  const getStatusText = () => {
    if (message) return message;
    
    switch (status) {
      case 'loading':
        return 'Chargement...';
      case 'playing':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      default:
        return 'Prêt';
    }
  };

  const getPosition = () => {
    switch (device) {
      case 'mobile':
        return 'top-2 right-2';
      case 'tablet':
        return 'top-3 right-3';
      default:
        return 'top-4 right-4';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`absolute ${getPosition()} z-20`}>
      <div className={`${getStatusColor()} backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1.5 text-xs font-medium shadow-lg`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        
        {/* Progress bar for loading */}
        {status === 'loading' && progress > 0 && (
          <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewStatusIndicator;
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';

interface PreviewInteractionHandlerProps {
  children: React.ReactNode;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onFullscreen?: () => void;
  showControls?: boolean;
  isPlaying?: boolean;
  canReset?: boolean;
  device: 'desktop' | 'tablet' | 'mobile';
}

const PreviewInteractionHandler: React.FC<PreviewInteractionHandlerProps> = ({
  children,
  onPlay,
  onPause,
  onReset,
  onFullscreen,
  showControls = true,
  isPlaying = false,
  canReset = true,
  device
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showControlsTimeout, setShowControlsTimeout] = useState<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (showControlsTimeout) {
      clearTimeout(showControlsTimeout);
    }
  }, [showControlsTimeout]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Auto-hide controls after 2 seconds
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 2000);
    setShowControlsTimeout(timeout);
  }, []);

  useEffect(() => {
    return () => {
      if (showControlsTimeout) {
        clearTimeout(showControlsTimeout);
      }
    };
  }, [showControlsTimeout]);

  const getControlsPosition = () => {
    switch (device) {
      case 'mobile':
        return 'bottom-4 left-4 right-4';
      case 'tablet':
        return 'bottom-6 left-6 right-6';
      default:
        return 'bottom-8 left-8 right-8';
    }
  };

  return (
    <div 
      className="relative w-full h-full group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Preview Controls */}
      {showControls && (isHovered || device !== 'desktop') && (
        <div 
          className={`absolute ${getControlsPosition()} z-30 animate-fade-in`}
        >
          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-center space-x-3">
            {/* Play/Pause Button */}
            {(onPlay || onPause) && (
              <button
                onClick={isPlaying ? onPause : onPlay}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
            )}
            
            {/* Reset Button */}
            {onReset && canReset && (
              <button
                onClick={onReset}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
            )}
            
            {/* Fullscreen Button */}
            {onFullscreen && device === 'desktop' && (
              <button
                onClick={onFullscreen}
                className="flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Info */}
      {device === 'desktop' && isHovered && (
        <div className="absolute top-4 left-4 z-30 animate-fade-in">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/80">
            <div className="space-y-1">
              {onPlay && <div>Espace: Play/Pause</div>}
              {onReset && <div>R: Reset</div>}
              {onFullscreen && <div>F: Fullscreen</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewInteractionHandler;
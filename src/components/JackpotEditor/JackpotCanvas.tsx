import React, { useState, useMemo } from 'react';
import JackpotGame from './JackpotGame';
import type { DeviceType } from '../../utils/deviceDimensions';
import { getDeviceDimensions } from '../../utils/deviceDimensions';

export interface JackpotCanvasProps {
  selectedDevice: DeviceType;
  
  // Configuration du jeu
  jackpotConfig?: {
    containerColor?: string;
    slotBackgroundColor?: string;
    slotBorderColor?: string;
    buttonColor?: string;
    borderStyle?: 'classic' | 'neon' | 'metallic' | 'luxury';
    borderWidth?: number;
    symbols?: string[];
    winProbability?: number;
    backgroundImage?: string;
  };
  
  onConfigChange?: (config: any) => void;
  
  // Background du canvas
  background?: {
    type: 'color' | 'image';
    value: string;
  };
  
  // Zoom
  zoom?: number;
  
  // Mode preview
  isPreview?: boolean;
}

const JackpotCanvas: React.FC<JackpotCanvasProps> = ({
  selectedDevice,
  jackpotConfig = {},
  onConfigChange,
  background = { type: 'color', value: '#f3f4f6' },
  zoom = 1,
  isPreview = true
}) => {
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0 });

  // Dimensions du canvas selon l'appareil
  const canvasDimensions = useMemo(() => {
    const dims = getDeviceDimensions(selectedDevice);
    return {
      width: dims.width,
      height: dims.height
    };
  }, [selectedDevice]);

  const handleWin = () => {
    setGameStats(prev => ({ ...prev, wins: prev.wins + 1 }));
  };

  const handleLose = () => {
    setGameStats(prev => ({ ...prev, losses: prev.losses + 1 }));
  };

  const canvasStyle: React.CSSProperties = {
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  // Appliquer le background
  if (background.type === 'color') {
    canvasStyle.backgroundColor = background.value;
  } else if (background.type === 'image') {
    canvasStyle.backgroundImage = `url(${background.value})`;
    canvasStyle.backgroundSize = 'cover';
    canvasStyle.backgroundPosition = 'center';
    canvasStyle.backgroundRepeat = 'no-repeat';
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div style={canvasStyle}>
        {/* Jeu Jackpot centré */}
        <JackpotGame
          containerColor={jackpotConfig.containerColor}
          slotBackgroundColor={jackpotConfig.slotBackgroundColor}
          slotBorderColor={jackpotConfig.slotBorderColor}
          buttonColor={jackpotConfig.buttonColor}
          borderStyle={jackpotConfig.borderStyle}
          borderWidth={jackpotConfig.borderWidth}
          symbols={jackpotConfig.symbols}
          winProbability={jackpotConfig.winProbability}
          backgroundImage={jackpotConfig.backgroundImage}
          onWin={handleWin}
          onLose={handleLose}
          isPreview={isPreview}
        />

        {/* Statistiques en overlay (mode développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div>Victoires: {gameStats.wins}</div>
            <div>Défaites: {gameStats.losses}</div>
            <div>Ratio: {gameStats.wins + gameStats.losses > 0 ? 
              Math.round((gameStats.wins / (gameStats.wins + gameStats.losses)) * 100) : 0}%
            </div>
          </div>
        )}

        {/* Indicateur de device */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          textTransform: 'uppercase'
        }}>
          {selectedDevice} ({canvasDimensions.width}×{canvasDimensions.height})
        </div>
      </div>
    </div>
  );
};

export default JackpotCanvas;

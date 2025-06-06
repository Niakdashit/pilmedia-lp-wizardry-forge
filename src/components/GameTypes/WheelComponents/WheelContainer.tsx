
import React from 'react';
import { GameDimensions } from '../../../hooks/useGameSize';

interface WheelContainerProps {
  children: React.ReactNode;
  gamePosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
  gameDimensions: GameDimensions;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const WheelContainer: React.FC<WheelContainerProps> = ({
  children,
  gamePosition,
  gameDimensions,
  previewDevice
}) => {
  // Crop the wheel on mobile when placed left, right or bottom
  const isMobile = previewDevice === 'mobile';
  const isCroppablePosition = ['left', 'right', 'bottom'].includes(gamePosition);
  const shouldCropWheel = isMobile && isCroppablePosition;

  const getAbsolutePositionStyles = (): React.CSSProperties => {
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      zIndex: 10
    };

    const safeMargin = 20;

    // When cropping, position the wheel so only the desired part is visible
    if (shouldCropWheel) {
      switch (gamePosition) {
        case 'left':
          // Show only right part of wheel (wheel positioned so left half is cut off)
          return {
            ...containerStyle,
            flexDirection: 'row-reverse',
            left: `0px`, // Position container at left edge
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${gameDimensions.width / 2}px`, // Container shows only half width
            height: `${gameDimensions.height}px`,
            overflow: 'hidden'
          };
        case 'right':
          // Show only left part of wheel (wheel positioned so right half is cut off)
          return {
            ...containerStyle,
            flexDirection: 'row',
            right: `0px`, // Position container at right edge  
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${gameDimensions.width / 2}px`, // Container shows only half width
            height: `${gameDimensions.height}px`,
            overflow: 'hidden'
          };
        case 'bottom':
          // Show only top part of wheel (wheel positioned so bottom half is cut off)
          return {
            ...containerStyle,
            flexDirection: 'column',
            bottom: `0px`, // Position container at bottom edge
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${gameDimensions.width}px`,
            height: `${gameDimensions.height / 2}px`, // Container shows only half height
            overflow: 'hidden'
          };
      }
    }

    // Default positioning for non-cropped cases
    switch (gamePosition) {
      case 'top':
        return {
          ...containerStyle,
          flexDirection: 'column-reverse',
          top: `${safeMargin}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`
        };
      case 'bottom':
        return {
          ...containerStyle,
          flexDirection: 'column',
          bottom: `${safeMargin}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`
        };
      case 'left':
        return {
          ...containerStyle,
          flexDirection: 'row-reverse',
          left: `${safeMargin}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`
        };
      case 'right':
        return {
          ...containerStyle,
          flexDirection: 'row-reverse',
          right: `${safeMargin}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`
        };
      default:
        // center
        return {
          ...containerStyle,
          flexDirection: 'column',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`
        };
    }
  };

  return (
    <div style={getAbsolutePositionStyles()}>
      {/* For cropped positions, we need to position the wheel so it overflows and gets cut */}
      <div style={shouldCropWheel ? {
        position: 'relative',
        left: gamePosition === 'left' ? `${gameDimensions.width / 2}px` : 
              gamePosition === 'right' ? `-${gameDimensions.width / 2}px` : '0px',
        top: gamePosition === 'bottom' ? `-${gameDimensions.height / 2}px` : '0px'
      } : {}}>
        {children}
      </div>
    </div>
  );
};

export default WheelContainer;

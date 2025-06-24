
import { useEffect, useRef } from 'react';

interface PremiumAnimationOptions {
  spinning: boolean;
  onAnimationFrame?: (timestamp: number) => void;
}

export const usePremiumWheelAnimations = ({
  spinning,
  onAnimationFrame
}: PremiumAnimationOptions) => {
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!spinning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      
      if (onAnimationFrame) {
        onAnimationFrame(elapsed);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [spinning, onAnimationFrame]);

  return {
    isAnimating: spinning
  };
};

export const createPremiumSpinningEffects = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  theme: string,
  elapsed: number
) => {
  switch (theme) {
    case 'modern':
      createModernSpinningEffects(ctx, center, radius, elapsed);
      break;
    case 'luxury':
      createLuxurySpinningEffects(ctx, center, radius, elapsed);
      break;
    case 'neon':
      createNeonSpinningEffects(ctx, center, radius, elapsed);
      break;
    default:
      createModernSpinningEffects(ctx, center, radius, elapsed);
  }
};

const createModernSpinningEffects = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  elapsed: number
) => {
  // Rotating energy rings
  ctx.save();
  ctx.globalAlpha = 0.3;
  
  for (let i = 0; i < 3; i++) {
    const ringRadius = radius + 20 + i * 5;
    const rotation = (elapsed * 0.001 + i * 120) * Math.PI / 180;
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);
    
    const gradient = ctx.createLinearGradient(-ringRadius, 0, ringRadius, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
};

const createLuxurySpinningEffects = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  elapsed: number
) => {
  // Golden particle trail
  ctx.save();
  ctx.globalAlpha = 0.6;
  
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const angle = (elapsed * 0.002 + i * 45) * Math.PI / 180;
    const particleRadius = radius + 25;
    const x = center + particleRadius * Math.cos(angle);
    const y = center + particleRadius * Math.sin(angle);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#DAA520');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  ctx.restore();
};

const createNeonSpinningEffects = (
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  elapsed: number
) => {
  // Electric arcs
  ctx.save();
  ctx.globalAlpha = 0.8;
  
  const arcCount = 6;
  for (let i = 0; i < arcCount; i++) {
    const angle = (elapsed * 0.003 + i * 60) * Math.PI / 180;
    const arcRadius = radius + 15;
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);
    
    // Create zigzag electric effect
    ctx.beginPath();
    ctx.moveTo(arcRadius - 10, 0);
    
    for (let j = 0; j < 5; j++) {
      const x = arcRadius - 10 + j * 4;
      const y = (Math.random() - 0.5) * 10;
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 8;
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
};

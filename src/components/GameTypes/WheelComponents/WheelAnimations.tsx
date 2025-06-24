
import { useEffect, useRef } from 'react';

interface UseWheelAnimationsProps {
  spinning: boolean;
  rotation: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  shadowCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useWheelAnimations = ({
  spinning,
  rotation,
  canvasRef,
  shadowCanvasRef
}: UseWheelAnimationsProps) => {
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }

  const createParticles = (centerX: number, centerY: number, radius: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      particles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 60,
        maxLife: 60,
        color: `hsl(${Math.random() * 60 + 40}, 80%, 60%)`,
        size: Math.random() * 3 + 1
      });
    }
    return particles;
  };

  const updateParticles = (particles: Particle[]) => {
    return particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      particle.vy += 0.1; // gravity
      return particle.life > 0;
    });
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const animateSpinningEffects = () => {
    if (!spinning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 60;

    // Update particles
    particlesRef.current = updateParticles(particlesRef.current);

    // Add new particles occasionally
    if (Math.random() < 0.3 && particlesRef.current.length < 50) {
      const newParticles = createParticles(centerX, centerY, radius + 20);
      particlesRef.current.push(...newParticles.slice(0, 3));
    }

    // Draw motion trails
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 8; i++) {
      const angle = (rotation + i * 45) * Math.PI / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draw particles
    drawParticles(ctx, particlesRef.current);

    if (spinning) {
      animationRef.current = requestAnimationFrame(animateSpinningEffects);
    }
  };

  const applySpinTransition = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const shadow = shadowCanvasRef.current;

    if (spinning) {
      canvas.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.1)';
      if (shadow) {
        shadow.style.filter = 'blur(6px)';
      }
      
      // Start particle animation
      particlesRef.current = [];
      animateSpinningEffects();
    } else {
      canvas.style.filter = 'brightness(1) contrast(1) saturate(1)';
      if (shadow) {
        shadow.style.filter = 'blur(4px)';
      }
      
      // Stop animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clear remaining particles gradually
      setTimeout(() => {
        particlesRef.current = [];
      }, 1000);
    }
  };

  useEffect(() => {
    applySpinTransition();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spinning]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.style.transform = `rotate(${rotation}deg)`;
    canvas.style.transition = spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
  }, [rotation, spinning]);

  return {
    particles: particlesRef.current
  };
};

export const createSparkleEffect = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  time: number
) => {
  for (let i = 0; i < 6; i++) {
    const angle = (time * 0.002 + i * 60) * Math.PI / 180;
    const x = centerX + (radius + 25) * Math.cos(angle);
    const y = centerY + (radius + 25) * Math.sin(angle);
    const size = 3 + Math.sin(time * 0.01 + i) * 2;

    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    
    // Draw star shape
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const starAngle = (j * 144) * Math.PI / 180;
      const starX = size * Math.cos(starAngle);
      const starY = size * Math.sin(starAngle);
      if (j === 0) {
        ctx.moveTo(starX, starY);
      } else {
        ctx.lineTo(starX, starY);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

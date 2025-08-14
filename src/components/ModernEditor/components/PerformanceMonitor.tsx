import React, { memo, useEffect, useState } from 'react';
import { useEditorPerformance } from '@/stores/editorStore';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  updatesPerSecond: number;
}

const PerformanceMonitor: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    updatesPerSecond: 0
  });
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');
  
  const { updatesPerSecond } = useEditorPerformance();

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      // Update metrics every second
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Memory usage (if available)
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          updatesPerSecond: Math.round(updatesPerSecond)
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, updatesPerSecond]);

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white text-xs p-3 rounded-lg font-mono backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-semibold">Performance Monitor</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span>FPS:</span>
          <span className={getPerformanceColor(metrics.fps, { good: 50, warning: 30 })}>
            {metrics.fps}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Updates/s:</span>
          <span className={getPerformanceColor(10 - metrics.updatesPerSecond, { good: 8, warning: 5 })}>
            {metrics.updatesPerSecond}
          </span>
        </div>
        
        {metrics.memoryUsage > 0 && (
          <div className="flex justify-between items-center">
            <span>Memory:</span>
            <span className={getPerformanceColor(100 - metrics.memoryUsage, { good: 80, warning: 50 })}>
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
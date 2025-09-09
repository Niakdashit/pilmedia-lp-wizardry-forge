import React, { useState, useEffect } from 'react';
import { Activity, X } from 'lucide-react';

export const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(process.env.NODE_ENV === 'development');
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    elementCount: 0,
    memoryUsage: 0,
    updatesPerSecond: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const updateMetrics = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          updatesPerSecond: Math.round((frameCount * 1000) / (now - lastTime))
        }));
        frameCount = 0;
        lastTime = now;
      }

      if (isVisible) {
        requestAnimationFrame(updateMetrics);
      }
    };

    requestAnimationFrame(updateMetrics);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={14} />
        <span>Performance</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-auto hover:text-gray-300"
        >
          <X size={12} />
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
        <div>Elements: {metrics.elementCount}</div>
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        <div>FPS: {metrics.updatesPerSecond}</div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import ModernEditorCanvas from '../ModernEditor/ModernEditorCanvas';

interface CanvaCanvasProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  selectedElement: any;
  onElementSelect: (element: any) => void;
  onElementDeselect: () => void;
}

const CanvaCanvas: React.FC<CanvaCanvasProps> = ({
  campaign,
  setCampaign,
  previewDevice,
  setPreviewDevice
}) => {
  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'desktop':
        return {
          width: '1280px',
          height: '720px', // 16:9 ratio
          maxWidth: '90%',
          maxHeight: '70vh'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '60%',
          maxHeight: '70vh'
        };
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxWidth: '40%',
          maxHeight: '70vh'
        };
    }
  };

  const getDeviceFrame = () => {
    const baseStyles = "bg-white shadow-2xl overflow-hidden relative";
    
    switch (previewDevice) {
      case 'desktop':
        return `${baseStyles} rounded-lg border border-[#e5e7eb]`;
      case 'tablet':
        return `${baseStyles} rounded-[2rem] border-[6px] border-black`;
      case 'mobile':
        return `${baseStyles} rounded-[2.5rem] border-[8px] border-black relative before:absolute before:top-0 before:left-1/2 before:transform before:-translate-x-1/2 before:w-16 before:h-1 before:bg-black before:rounded-b-lg`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Device Selector */}
      <div className="flex justify-center py-4 bg-[#f7f9fb]">
        <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-[#e5e7eb]">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
              previewDevice === 'desktop' 
                ? 'bg-[#3b82f6] text-white shadow-sm' 
                : 'text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6]'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-medium">Desktop</span>
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
              previewDevice === 'tablet' 
                ? 'bg-[#3b82f6] text-white shadow-sm' 
                : 'text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6]'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="text-sm font-medium">Tablette</span>
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
              previewDevice === 'mobile' 
                ? 'bg-[#3b82f6] text-white shadow-sm' 
                : 'text-[#6b7280] hover:text-[#374151] hover:bg-[#f3f4f6]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Mobile</span>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f7f9fb]">
        <div
          className={getDeviceFrame()}
          style={getDeviceStyles()}
        >
          {/* Device status bar for mobile */}
          {previewDevice === 'mobile' && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-black rounded-full"></div>
          )}
          
          {/* Tablet home indicator */}
          {previewDevice === 'tablet' && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full"></div>
          )}

          {/* Canvas Content */}
          <div className="w-full h-full">
            <ModernEditorCanvas
              campaign={campaign}
              setCampaign={setCampaign}
              previewDevice={previewDevice}
              gameSize="medium"
              gamePosition="center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaCanvas;
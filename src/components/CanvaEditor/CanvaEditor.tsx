import React, { useState } from 'react';
import { useModernCampaignEditor } from '../../hooks/useModernCampaignEditor';
import CanvaSidebar from './CanvaSidebar';
import CanvaCanvas from './CanvaCanvas';
import CanvaContextualToolbar from './CanvaContextualToolbar';
import CanvaBottomActions from './CanvaBottomActions';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CanvaEditor: React.FC = () => {
  const {
    campaign,
    setCampaign,
    previewDevice,
    setPreviewDevice,
    handleSave,
    isLoading,
    isModified
  } = useModernCampaignEditor();

  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleElementSelect = (element: any) => {
    setSelectedElement(element);
  };

  const handleElementDeselect = () => {
    setSelectedElement(null);
  };

  return (
    <div className="h-screen bg-[#f7f9fb] flex overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} bg-[#3d4043] flex flex-col`}>
        {/* Header with logo and project name */}
        <div className="p-4 border-b border-[#515356]">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <span className="text-white font-medium">Projet</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#9ca3af] hover:text-white transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <CanvaSidebar 
          campaign={campaign}
          setCampaign={setCampaign}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Contextual Toolbar */}
        {selectedElement && (
          <CanvaContextualToolbar
            selectedElement={selectedElement}
            onUpdate={(updates: any) => {
              // Update the selected element
              if (selectedElement.type === 'text') {
                setCampaign((prev: any) => ({
                  ...prev,
                  texts: prev.texts?.map((text: any) => 
                    text.id === selectedElement.id 
                      ? { ...text, ...updates }
                      : text
                  ) || []
                }));
              } else if (selectedElement.type === 'image') {
                setCampaign((prev: any) => ({
                  ...prev,
                  images: prev.images?.map((image: any) => 
                    image.id === selectedElement.id 
                      ? { ...image, ...updates }
                      : image
                  ) || []
                }));
              }
            }}
            onClose={handleElementDeselect}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <CanvaCanvas
            campaign={campaign}
            setCampaign={setCampaign}
            previewDevice={previewDevice}
            setPreviewDevice={setPreviewDevice}
            selectedElement={selectedElement}
            onElementSelect={handleElementSelect}
            onElementDeselect={handleElementDeselect}
          />
        </div>

        {/* Bottom Actions */}
        <CanvaBottomActions
          onPreview={() => {
            // Open preview modal
          }}
          onSave={() => handleSave(true)}
          onSaveAndExit={() => handleSave(false)}
          isLoading={isLoading}
          isModified={isModified}
        />
      </div>
    </div>
  );
};

export default CanvaEditor;
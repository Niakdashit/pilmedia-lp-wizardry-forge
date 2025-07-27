import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProToolbar from './ProToolbar';
import ProElement from './ProElement';
import ContextMenu from './ContextMenu';
import SelectionBox from './SelectionBox';
import RulerGuides from './RulerGuides';
import { SmartWheel } from '../../SmartWheel';
import { useProCanvasState } from './hooks/useProCanvasState';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

interface ProCanvasEditorProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  elements: any[];
  onElementsChange: (elements: any[]) => void;
  background?: { type: 'color' | 'image'; value: string };
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
  zoom?: number;
}

const ProCanvasEditor: React.FC<ProCanvasEditorProps> = ({
  selectedDevice,
  elements,
  onElementsChange,
  background,
  // campaign,
  // onCampaignChange,
  zoom = 1
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; element?: any } | null>(null);
  
  const {
    selectedElements,
    clipboardData,
    selectionBox,
    snapGuides,
    setSelectedElements,
    setClipboardData,
    setSelectionBox,
    setSnapGuides,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useProCanvasState(elements, onElementsChange);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDragStart,
    handleDrop,
    isDragging,
    dragOffset
  } = useCanvasInteractions({
    elements,
    onElementsChange,
    selectedElements,
    setSelectedElements,
    setSelectionBox,
    setSnapGuides,
    canvasRef,
    addToHistory
  });

  useKeyboardShortcuts({
    onCopy: () => {
      if (selectedElements.length > 0) {
        const elementsToCopy = elements.filter(el => selectedElements.includes(el.id));
        setClipboardData(elementsToCopy);
      }
    },
    onPaste: () => {
      if (clipboardData.length > 0) {
        const newElements = clipboardData.map(el => ({
          ...el,
          id: `${el.id}-copy-${Date.now()}`,
          x: el.x + 20,
          y: el.y + 20
        }));
        onElementsChange([...elements, ...newElements]);
        setSelectedElements(newElements.map(el => el.id));
        addToHistory([...elements, ...newElements]);
      }
    },
    onDelete: () => {
      if (selectedElements.length > 0) {
        const newElements = elements.filter(el => !selectedElements.includes(el.id));
        onElementsChange(newElements);
        setSelectedElements([]);
        addToHistory(newElements);
      }
    },
    onUndo: () => {
      if (canUndo) undo();
    },
    onRedo: () => {
      if (canRedo) redo();
    },
    onSelectAll: () => {
      setSelectedElements(elements.map(el => el.id));
    }
  });

  const getCanvasSize = () => {
    const sizes = {
      desktop: { width: 810, height: 600 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 812 }
    };
    return sizes[selectedDevice];
  };

  const canvasSize = getCanvasSize();

  const handleElementUpdate = useCallback((id: string, updates: any) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(newElements);
    addToHistory(newElements);
  }, [elements, onElementsChange, addToHistory]);

  const handleElementDelete = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    onElementsChange(newElements);
    setSelectedElements(prev => prev.filter(selId => selId !== id));
    addToHistory(newElements);
  }, [elements, onElementsChange, setSelectedElements, addToHistory]);

  const handleContextMenu = useCallback((e: React.MouseEvent, element?: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      element
    });
  }, []);

  const duplicateElement = useCallback((element: any) => {
    const newElement = {
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    };
    onElementsChange([...elements, newElement]);
    addToHistory([...elements, newElement]);
  }, [elements, onElementsChange, addToHistory]);

  const selectedElementsData = elements.filter(el => selectedElements.includes(el.id));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
        {/* Professional Toolbar */}
        <ProToolbar
          selectedElements={selectedElementsData}
          onElementUpdate={handleElementUpdate}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          zoom={zoom}
        />

        {/* Canvas Container */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center items-center min-h-full">
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200"
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onContextMenu={(e) => handleContextMenu(e)}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Ruler Guides */}
              <RulerGuides 
                width={canvasSize.width}
                height={canvasSize.height}
                zoom={zoom}
                snapGuides={snapGuides}
              />

              {/* Background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: background?.type === 'image' 
                    ? `url(${background.value}) center/cover no-repeat` 
                    : background?.value || 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
                }}
              >
                {/* Smart Wheel */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3/5">
                  <SmartWheel
                    segments={[
                      { id: '1', label: '10€', color: '#841b60', textColor: '#ffffff' },
                      { id: '2', label: '20€', color: '#ffffff', textColor: '#841b60' },
                      { id: '3', label: '5€', color: '#841b60', textColor: '#ffffff' },
                      { id: '4', label: 'Perdu', color: '#ffffff', textColor: '#841b60' },
                      { id: '5', label: '50€', color: '#841b60', textColor: '#ffffff' },
                      { id: '6', label: '30€', color: '#ffffff', textColor: '#841b60' }
                    ]}
                    theme="modern"
                    size={selectedDevice === 'desktop' ? 200 : selectedDevice === 'tablet' ? 180 : 140}
                    borderStyle="classic"
                    brandColors={{
                      primary: '#841b60',
                      secondary: '#4ecdc4',
                      accent: '#45b7d1'
                    }}
                    buttonPosition="center"
                    customButton={{
                      text: 'GO',
                      color: '#841b60',
                      textColor: '#ffffff'
                    }}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Elements */}
              {elements.map((element) => (
                <ProElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElements.includes(element.id)}
                  isMultiSelected={selectedElements.length > 1}
                  onSelect={(id, isMultiSelect) => {
                    if (isMultiSelect) {
                      setSelectedElements(prev => 
                        prev.includes(id) 
                          ? prev.filter(selId => selId !== id)
                          : [...prev, id]
                      );
                    } else {
                      setSelectedElements([id]);
                    }
                  }}
                  onUpdate={handleElementUpdate}
                  onDelete={handleElementDelete}
                  onContextMenu={handleContextMenu}
                  onDragStart={handleDragStart}
                  snapGuides={snapGuides}
                  isDragging={isDragging}
                  dragOffset={dragOffset}
                />
              ))}

              {/* Selection Box */}
              {selectionBox && (
                <SelectionBox
                  box={selectionBox}
                  onElementsSelect={(elementIds) => setSelectedElements(elementIds)}
                  elements={elements}
                />
              )}

              {/* Snap Guides */}
              {snapGuides.map((guide, index) => (
                <div
                  key={index}
                  className="absolute bg-blue-500 pointer-events-none z-50"
                  style={{
                    left: guide.type === 'vertical' ? `${guide.position}px` : 0,
                    top: guide.type === 'horizontal' ? `${guide.position}px` : 0,
                    width: guide.type === 'vertical' ? '1px' : '100%',
                    height: guide.type === 'horizontal' ? '1px' : '100%',
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
          </div>

          {/* Canvas Info */}
          <div className="text-center mt-4 text-sm text-gray-500">
            {selectedDevice} • {canvasSize.width} × {canvasSize.height}px • 
            {selectedElements.length > 0 && ` ${selectedElements.length} élément(s) sélectionné(s)`}
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            element={contextMenu.element}
            onClose={() => setContextMenu(null)}
            onDuplicate={duplicateElement}
            onDelete={handleElementDelete}
            onBringToFront={(id) => {
              const element = elements.find(el => el.id === id);
              if (element) {
                const newElements = [
                  ...elements.filter(el => el.id !== id),
                  { ...element, zIndex: Math.max(...elements.map(el => el.zIndex || 0)) + 1 }
                ];
                onElementsChange(newElements);
                addToHistory(newElements);
              }
            }}
            onSendToBack={(id) => {
              const element = elements.find(el => el.id === id);
              if (element) {
                const newElements = [
                  { ...element, zIndex: Math.min(...elements.map(el => el.zIndex || 0)) - 1 },
                  ...elements.filter(el => el.id !== id)
                ];
                onElementsChange(newElements);
                addToHistory(newElements);
              }
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default ProCanvasEditor;
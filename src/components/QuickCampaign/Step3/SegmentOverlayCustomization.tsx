import React, { useRef, useState } from 'react';
import { Layers, X, Image, Sticker, Grid } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const SegmentOverlayCustomization: React.FC = () => {
  const { segmentOverlays, setSegmentOverlays, segmentCount } = useQuickCampaignStore();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSegment !== null) {
      const url = URL.createObjectURL(file);
      const newOverlay = {
        id: Date.now().toString(),
        segmentIndex: selectedSegment,
        type: 'image' as const,
        file,
        url,
        position: { x: 50, y: 50 },
        size: 60
      };

      setSegmentOverlays({
        enabled: true,
        overlays: [...segmentOverlays.overlays, newOverlay]
      });
    }
  };

  const handleRemoveOverlay = (overlayId: string) => {
    const overlay = segmentOverlays.overlays.find(o => o.id === overlayId);
    if (overlay?.url) {
      URL.revokeObjectURL(overlay.url);
    }
    
    setSegmentOverlays({
      overlays: segmentOverlays.overlays.filter(o => o.id !== overlayId)
    });
  };

  const addPatternOverlay = (type: 'sticker' | 'pattern') => {
    if (selectedSegment !== null) {
      const newOverlay = {
        id: Date.now().toString(),
        segmentIndex: selectedSegment,
        type,
        file: null,
        url: null,
        position: { x: 50, y: 50 },
        size: 40
      };

      setSegmentOverlays({
        enabled: true,
        overlays: [...segmentOverlays.overlays, newOverlay]
      });
    }
  };

  const updateOverlayProperty = (overlayId: string, property: string, value: any) => {
    setSegmentOverlays({
      overlays: segmentOverlays.overlays.map(overlay =>
        overlay.id === overlayId
          ? { ...overlay, [property]: value }
          : overlay
      )
    });
  };

  const getSegmentOverlays = (segmentIndex: number) => {
    return segmentOverlays.overlays.filter(o => o.segmentIndex === segmentIndex);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Overlays des segments</h3>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Activer les overlays</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={segmentOverlays.enabled}
              onChange={(e) => setSegmentOverlays({ enabled: e.target.checked })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {segmentOverlays.enabled && (
          <div className="space-y-6">
            {/* Segment Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sélectionner un segment
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: segmentCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSegment(i)}
                    className={`p-3 text-sm rounded-lg border transition-colors relative ${
                      selectedSegment === i
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Segment {i + 1}
                    {getSegmentOverlays(i).length > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                        {getSegmentOverlays(i).length}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Overlay Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ajouter un overlay au segment {selectedSegment + 1}
              </label>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm">Image</span>
                </button>
                <button
                  onClick={() => addPatternOverlay('sticker')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Sticker className="w-4 h-4" />
                  <span className="text-sm">Sticker</span>
                </button>
                <button
                  onClick={() => addPatternOverlay('pattern')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Grid className="w-4 h-4" />
                  <span className="text-sm">Motif</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Current Overlays */}
            {getSegmentOverlays(selectedSegment).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overlays actuels
                </label>
                <div className="space-y-3">
                  {getSegmentOverlays(selectedSegment).map((overlay) => (
                    <div key={overlay.id} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {overlay.url ? (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={overlay.url}
                                alt="Overlay"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {overlay.type === 'sticker' ? <Sticker className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {overlay.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              Position: {overlay.position.x}%, {overlay.position.y}%
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveOverlay(overlay.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Position X: {overlay.position.x}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={overlay.position.x}
                            onChange={(e) => updateOverlayProperty(overlay.id, 'position', {
                              ...overlay.position,
                              x: parseInt(e.target.value)
                            })}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Position Y: {overlay.position.y}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={overlay.position.y}
                            onChange={(e) => updateOverlayProperty(overlay.id, 'position', {
                              ...overlay.position,
                              y: parseInt(e.target.value)
                            })}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Taille: {overlay.size}%
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={overlay.size}
                            onChange={(e) => updateOverlayProperty(overlay.id, 'size', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Layers className="w-4 h-4 text-indigo-600 mt-0.5" />
                <div className="text-xs text-indigo-700">
                  <p className="font-medium mb-1">À propos des overlays :</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Les overlays s'affichent par-dessus le contenu des segments</li>
                    <li>Vous pouvez ajouter plusieurs overlays par segment</li>
                    <li>Utilisez des images PNG avec transparence pour de meilleurs résultats</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentOverlayCustomization;

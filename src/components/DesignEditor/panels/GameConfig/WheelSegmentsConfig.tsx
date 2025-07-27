import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, RotateCcw } from 'lucide-react';
import { getWheelSegments } from '../../../../utils/wheelConfig';

interface WheelSegmentsConfigProps {
  campaign?: any;
  onCampaignChange?: (campaign: any) => void;
}

const WheelSegmentsConfig: React.FC<WheelSegmentsConfigProps> = ({
  campaign,
  onCampaignChange
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSegmentText, setNewSegmentText] = useState('');
  const [newSegmentColor, setNewSegmentColor] = useState('#ff6b6b');

  const segments = getWheelSegments(campaign) || [];

  const updateSegments = useCallback((newSegments: any[]) => {
    if (onCampaignChange && campaign) {
      onCampaignChange({
        ...campaign,
        gameConfig: {
          ...campaign.gameConfig,
          wheel: {
            ...campaign.gameConfig?.wheel,
            segments: newSegments
          }
        }
      });
    }
  }, [campaign, onCampaignChange]);

  const addSegment = () => {
    if (newSegmentText.trim()) {
      const newSegment = {
        id: `segment-${Date.now()}`,
        label: newSegmentText.trim(),
        color: newSegmentColor,
        textColor: '#ffffff'
      };
      updateSegments([...segments, newSegment]);
      setNewSegmentText('');
      setNewSegmentColor('#ff6b6b');
    }
  };

  const updateSegment = (index: number, updates: any) => {
    const updatedSegments = segments.map((segment: any, i: number) =>
      i === index ? { ...segment, ...updates } : segment
    );
    updateSegments(updatedSegments);
  };

  const deleteSegment = (index: number) => {
    const updatedSegments = segments.filter((_: any, i: number) => i !== index);
    updateSegments(updatedSegments);
  };

  const resetToDefault = () => {
    const defaultSegments = [
      { id: 'segment-1', label: 'Prix 1', color: '#ff6b6b', textColor: '#ffffff' },
      { id: 'segment-2', label: 'Prix 2', color: '#4ecdc4', textColor: '#ffffff' },
      { id: 'segment-3', label: 'Prix 3', color: '#45b7d1', textColor: '#ffffff' },
      { id: 'segment-4', label: 'Prix 4', color: '#96ceb4', textColor: '#ffffff' },
      { id: 'segment-5', label: 'Dommage', color: '#feca57', textColor: '#000000' },
      { id: 'segment-6', label: 'Rejouer', color: '#ff9ff3', textColor: '#ffffff' }
    ];
    updateSegments(defaultSegments);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Segments de la roue</h3>
          <p className="text-sm text-gray-600">Configurez les prix et résultats de votre roue</p>
        </div>
        <button
          onClick={resetToDefault}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          title="Réinitialiser aux valeurs par défaut"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Current Segments */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Segments actuels ({segments.length})</h4>
        
        {segments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucun segment configuré</p>
            <p className="text-xs">Ajoutez des segments ci-dessous ou utilisez les valeurs par défaut</p>
          </div>
        ) : (
          <div className="space-y-2">
            {segments.map((segment: any, index: number) => (
              <div
                key={segment.id || index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* Color preview */}
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: segment.color }}
                />
                
                {/* Segment info */}
                <div className="flex-1">
                  {editingIndex === index ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={segment.label}
                        onChange={(e) => updateSegment(index, { label: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={() => setEditingIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingIndex(null);
                        }}
                        autoFocus
                      />
                      <input
                        type="color"
                        value={segment.color}
                        onChange={(e) => updateSegment(index, { color: e.target.value })}
                        className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{segment.label}</span>
                      <span className="text-xs text-gray-500">{segment.color}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSegment(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Segment */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700">Ajouter un segment</h4>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newSegmentText}
            onChange={(e) => setNewSegmentText(e.target.value)}
            placeholder="Nom du segment (ex: Prix 1)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addSegment();
            }}
          />
          <input
            type="color"
            value={newSegmentColor}
            onChange={(e) => setNewSegmentColor(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
            title="Couleur du segment"
          />
          <button
            onClick={addSegment}
            disabled={!newSegmentText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-blue-900 mb-1">💡 Conseils</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Utilisez des couleurs contrastées pour une meilleure lisibilité</li>
          <li>• Variez les prix pour maintenir l'engagement</li>
          <li>• Limitez le nombre de segments pour éviter la confusion</li>
        </ul>
      </div>
    </div>
  );
};

export default WheelSegmentsConfig;
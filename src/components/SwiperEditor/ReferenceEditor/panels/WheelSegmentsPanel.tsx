import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface WheelSegmentsPanelProps {
  onBack: () => void;
}

interface Segment {
  id: string;
  label: string;
  color: string;
  probability: number;
  textColor: string;
}

const defaultColorPalette = [
  '#44444d', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#feca57', '#ff9ff3', '#ff6b6b', '#48dbfb',
  '#1dd1a1', '#ff9f43', '#5f27cd', '#54a0ff'
];

const WheelSegmentsPanel: React.FC<WheelSegmentsPanelProps> = ({
  onBack,
}) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const campaign = useEditorStore((s) => s.campaign as any);
  const setCampaign = useEditorStore((s) => s.setCampaign as any);

  // Initialize segments from campaign data
  useEffect(() => {
    const rawSegments = campaign?.gameConfig?.wheel?.segments || 
                       campaign?.config?.roulette?.segments || [];
    
    if (rawSegments.length > 0) {
      // Ensure all segments have probability and textColor
      const formattedSegments = rawSegments.map((seg: any, index: number) => ({
        id: seg.id || `segment-${index}`,
        label: seg.label || `Segment ${index + 1}`,
        color: seg.color || defaultColorPalette[index % defaultColorPalette.length],
        probability: typeof seg.probability === 'number' ? seg.probability : 100 / rawSegments.length,
        textColor: seg.textColor || '#ffffff'
      }));
      setSegments(formattedSegments);
    } else {
      // Initialize with 6 default segments
      const defaultSegments = Array(6).fill(null).map((_, i) => ({
        id: `segment-${i}`,
        label: `Segment ${i + 1}`,
        color: defaultColorPalette[i % defaultColorPalette.length],
        probability: 100 / 6,
        textColor: '#ffffff'
      }));
      setSegments(defaultSegments);
      updateSegmentsInCampaign(defaultSegments);
    }
  }, [campaign]);

  const updateSegmentsInCampaign = (updatedSegments: Segment[]) => {
    const normalized = updatedSegments.map(({ id, label, color, probability, textColor }) => ({
      id,
      label,
      color,
      probability,
      textColor
    }));

    setCampaign((prev: any) => ({
      ...prev,
      gameConfig: {
        ...prev.gameConfig,
        // Champ canonique utilisé par WheelConfigService / StandardizedWheel
        wheelSegments: normalized,
        wheel: {
          ...prev.gameConfig?.wheel,
          segments: normalized
        }
      },
      config: {
        ...prev.config,
        roulette: {
          ...prev.config?.roulette,
          segments: normalized
        }
      },
      _lastUpdate: Date.now()
    }));
  };

  const addSegment = () => {
    const newSegment: Segment = {
      id: `segment-${Date.now()}`,
      label: `Segment ${segments.length + 1}`,
      color: defaultColorPalette[segments.length % defaultColorPalette.length],
      probability: 0,
      textColor: '#ffffff'
    };
    
    const newSegments = [...segments, newSegment];
    // Redistribute probabilities
    const updatedSegments = redistributeProbabilities(newSegments);
    setSegments(updatedSegments);
    updateSegmentsInCampaign(updatedSegments);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) return; // Minimum 2 segments
    
    const newSegments = segments.filter((_, i) => i !== index);
    // Redistribute probabilities after removal
    const updatedSegments = redistributeProbabilities(newSegments);
    setSegments(updatedSegments);
    updateSegmentsInCampaign(updatedSegments);
  };

  const updateSegment = (index: number, updates: Partial<Segment>) => {
    const newSegments = [...segments];
    const currentSegment = newSegments[index];
    
    // Apply updates
    newSegments[index] = { ...currentSegment, ...updates };
    
    // If probability changed, ensure it's a valid number
    if (updates.probability !== undefined) {
      // Ensure probability is a valid number between 0 and 100
      let newProb = parseFloat(updates.probability.toString());
      if (isNaN(newProb)) newProb = 0;
      newProb = Math.max(0, Math.min(100, newProb));
      newSegments[index].probability = newProb;
      
      // Redistribute probabilities
      const updatedSegments = redistributeProbabilities(newSegments, index);
      setSegments(updatedSegments);
      updateSegmentsInCampaign(updatedSegments);
    } else {
      // For non-probability updates, just update the segment
      setSegments(newSegments);
      updateSegmentsInCampaign(newSegments);
    }
  };

  const redistributeProbabilities = (segments: Segment[], changedIndex?: number) => {
    if (segments.length === 0) return [];
    
    const newSegments = [...segments];
    const totalProbability = 100;
    
    // If it's the only segment, set to 100%
    if (newSegments.length === 1) {
      newSegments[0].probability = 100;
      return newSegments;
    }
    
    // If no segment was changed, distribute equally
    if (changedIndex === undefined) {
      const equalProb = totalProbability / newSegments.length;
      newSegments.forEach(seg => {
        seg.probability = equalProb;
      });
      return newSegments;
    }
    
    // Ensure the changed probability is within valid range
    const changedSegment = newSegments[changedIndex];
    changedSegment.probability = Math.max(0, Math.min(100, changedSegment.probability));
    
    // Calculate remaining probability for other segments
    const remainingProb = Math.max(0, totalProbability - changedSegment.probability);
    const otherSegments = newSegments.filter((_, i) => i !== changedIndex);
    
    if (otherSegments.length === 0) {
      return newSegments;
    }
    
    // Calculate weights for remaining segments (based on current probabilities)
    const totalWeight = otherSegments.reduce((sum, seg) => sum + seg.probability, 0);
    
    if (totalWeight <= 0) {
      // If no valid weights, distribute remaining probability equally
      const equalProb = remainingProb / otherSegments.length;
      otherSegments.forEach(seg => {
        seg.probability = equalProb;
      });
    } else {
      // Distribute remaining probability proportionally to current weights
      otherSegments.forEach(seg => {
        seg.probability = (seg.probability / totalWeight) * remainingProb;
      });
    }
    
    // Ensure total is exactly 100% (handle floating point errors)
    const total = newSegments.reduce((sum, seg) => sum + seg.probability, 0);
    const diff = totalProbability - total;
    if (Math.abs(diff) > 0.0001 && newSegments.length > 0) {
      // Distribute the difference to the first segment that can take it
      const firstSegment = newSegments[0];
      firstSegment.probability = Math.max(0, Math.min(100, firstSegment.probability + diff));
    }
    
    return newSegments;
  };

  const handleLabelChange = (index: number, value: string) => {
    updateSegment(index, { label: value });
  };

  const handleColorChange = (index: number, color: string) => {
    updateSegment(index, { color });
    setShowColorPicker(null);
  };

  const handleProbabilityChange = (index: number, value: number) => {
    updateSegment(index, { probability: value });
  };

  const handleTextColorChange = (index: number, color: string) => {
    updateSegment(index, { textColor: color });
    setShowColorPicker(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Retour
        </button>
        <h2 className="text-lg font-semibold">Gestion des segments</h2>
        <div className="w-8"></div> {/* For alignment */}
      </div>

      {/* Segments List */}
      <div className="space-y-4 mb-6">
        {segments.map((segment, index) => (
          <div 
            key={segment.id} 
            className="border rounded-lg p-4 relative"
            style={{ borderColor: segment.color }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Segment {index + 1}</h3>
              {segments.length > 2 && (
                <button
                  onClick={() => removeSegment(index)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Supprimer le segment"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Label */}
              <div>
                <Label htmlFor={`label-${index}`}>Nom</Label>
                <Input
                  id={`label-${index}`}
                  value={segment.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Color Picker */}
              <div>
                <Label>Couleur du segment</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <div 
                    className="w-8 h-8 rounded border cursor-pointer"
                    style={{ backgroundColor: segment.color }}
                    onClick={() => setShowColorPicker(showColorPicker === index ? null : index)}
                  />
                  {showColorPicker === index && (
                    <div className="absolute z-10">
                      <HexColorPicker 
                        color={segment.color} 
                        onChange={(color) => handleColorChange(index, color)} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Text Color Picker */}
              <div>
                <Label>Couleur du texte</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <div 
                    className="w-8 h-8 rounded border cursor-pointer flex items-center justify-center"
                    style={{ 
                      backgroundColor: segment.textColor,
                      borderColor: segment.textColor === '#ffffff' ? '#e5e7eb' : segment.textColor
                    }}
                    onClick={() => setShowColorPicker(showColorPicker === -index ? null : -index)}
                  >
                    <span className="text-xs" style={{ color: segment.textColor === '#ffffff' ? '#000000' : '#ffffff' }}>A</span>
                  </div>
                  {showColorPicker === -index && (
                    <div className="absolute z-10">
                      <HexColorPicker 
                        color={segment.textColor} 
                        onChange={(color) => handleTextColorChange(index, color)} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Probability Slider */}
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor={`probability-${index}`}>Probabilité: {segment.probability.toFixed(1)}%</Label>
                  <span className="text-sm text-gray-500">
                    {Math.round(segment.probability)}%
                  </span>
                </div>
                <Slider
                  id={`probability-${index}`}
                  min={0}
                  max={100}
                  step={0.1}
                  value={[segment.probability]}
                  onValueChange={([value]) => handleProbabilityChange(index, value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Segment Button */}
      <Button
        onClick={addSegment}
        variant="outline"
        className="w-full flex items-center justify-center space-x-2"
      >
        <Plus size={16} />
        <span>Ajouter un segment</span>
      </Button>

      {/* Total Probability Indicator */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Probabilité totale: {segments.reduce((sum, seg) => sum + seg.probability, 0).toFixed(1)}%
      </div>
    </div>
  );
};

export default WheelSegmentsPanel;

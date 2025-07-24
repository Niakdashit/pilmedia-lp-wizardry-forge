import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import BorderStyleSelector from '../../../SmartWheel/components/BorderStyleSelector';
import type { EditorConfig } from '../../QualifioEditorLayout';
interface WheelMechanicConfigProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
interface WheelSegment {
  id: string;
  label: string;
  color: string;
  probability: number;
  isWinning?: boolean;
}
const WheelMechanicConfig: React.FC<WheelMechanicConfigProps> = ({
  config,
  onConfigUpdate
}) => {
  const wheelSegments: WheelSegment[] = config.wheelSegments || [{
    id: '1',
    label: 'Segment 1',
    color: '#FF6B6B',
    probability: 20,
    isWinning: true
  }, {
    id: '2',
    label: 'Segment 2',
    color: '#4ECDC4',
    probability: 20,
    isWinning: false
  }, {
    id: '3',
    label: 'Segment 3',
    color: '#45B7D1',
    probability: 20,
    isWinning: false
  }, {
    id: '4',
    label: 'Segment 4',
    color: '#96CEB4',
    probability: 20,
    isWinning: true
  }, {
    id: '5',
    label: 'Segment 5',
    color: '#FFEAA7',
    probability: 20,
    isWinning: false
  }];
  const updateSegments = (newSegments: WheelSegment[]) => {
    onConfigUpdate({
      wheelSegments: newSegments
    });
  };
  const addSegment = () => {
    const newSegment: WheelSegment = {
      id: Date.now().toString(),
      label: `Segment ${wheelSegments.length + 1}`,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      probability: Math.floor(100 / (wheelSegments.length + 1)),
      isWinning: false
    };
    updateSegments([...wheelSegments, newSegment]);
  };
  const removeSegment = (id: string) => {
    if (wheelSegments.length > 2) {
      updateSegments(wheelSegments.filter(s => s.id !== id));
    }
  };
  const updateSegment = (id: string, updates: Partial<WheelSegment>) => {
    updateSegments(wheelSegments.map(s => s.id === id ? {
      ...s,
      ...updates
    } : s));
  };
  return <div className="space-y-6 py-px my-0">
      {/* Wheel Border Style */}
      <div className="premium-card mx-[30px] py-0 my-0">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style de la roue</h4>
        <div className="p-4 rounded-xl bg-sidebar-bg">
          <BorderStyleSelector currentStyle={config.borderStyle || 'classic'} onStyleChange={style => onConfigUpdate({
          borderStyle: style
        })} />
        </div>
      </div>

      {/* Wheel Segments */}
      <div className="premium-card mx-[30px]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sidebar-text-primary font-medium text-base">Segments de la roue</h4>
          <button onClick={addSegment} className="flex items-center gap-2 px-3 py-1 bg-sidebar-active text-white rounded-lg text-sm hover:opacity-90">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {wheelSegments.map((segment, index) => <div key={segment.id} className="p-3 bg-sidebar-surface rounded-lg border border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-sidebar-text">#{index + 1}</span>
                {wheelSegments.length > 2 && <button onClick={() => removeSegment(segment.id)} className="ml-auto text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group-premium">
                  <label className="text-xs">Libellé</label>
                  <input type="text" value={segment.label} onChange={e => updateSegment(segment.id, {
                label: e.target.value
              })} className="w-full text-sm" />
                </div>

                <div className="form-group-premium">
                  <label className="text-xs">Couleur</label>
                  <input type="color" value={segment.color} onChange={e => updateSegment(segment.id, {
                color: e.target.value
              })} className="w-full h-8" />
                </div>

                <div className="form-group-premium">
                  <label className="text-xs">Probabilité (%)</label>
                  <input type="number" value={segment.probability} onChange={e => updateSegment(segment.id, {
                probability: parseInt(e.target.value) || 0
              })} min="0" max="100" className="w-full text-sm" />
                </div>

                <div className="form-group-premium">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={segment.isWinning || false} onChange={e => updateSegment(segment.id, {
                  isWinning: e.target.checked
                })} />
                    Gagnant
                  </label>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default WheelMechanicConfig;
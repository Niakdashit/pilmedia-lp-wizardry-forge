
import React from 'react';

interface Segment {
  label: string;
  chance: number;
  color?: string;
  image?: File | null;
}

interface SegmentEditorProps {
  segments: Segment[];
  onSegmentChange: (index: number, field: keyof Segment, value: string | number) => void;
  onImageUpload: (index: number, file: File | null) => void;
  onRemoveSegment: (index: number) => void;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segments,
  onSegmentChange,
  onImageUpload,
  onRemoveSegment
}) => {
  return (
    <div className="space-y-4">
      {segments.map((seg, index) => (
        <div key={index} className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 border p-4 rounded-lg bg-white shadow-sm">
          <input
            type="text"
            placeholder="Nom du segment"
            value={seg.label}
            onChange={e => onSegmentChange(index, 'label', e.target.value)}
            className="border p-2 rounded w-full md:w-1/4"
          />
          <input
            type="number"
            placeholder="Chance (%)"
            value={seg.chance}
            onChange={e => onSegmentChange(index, 'chance', Number(e.target.value))}
            className="border p-2 rounded w-full md:w-1/6"
          />
          <input
            type="color"
            value={seg.color || '#d4dbe8'}
            onChange={e => onSegmentChange(index, 'color', e.target.value)}
            className="w-10 h-10 border rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => onImageUpload(index, e.target.files?.[0] || null)}
            className="border p-2 rounded w-full md:w-1/4"
          />
          <button
            onClick={() => onRemoveSegment(index)}
            className="bg-red-500 text-white px-4 py-2 rounded shadow"
          >
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
};

export default SegmentEditor;

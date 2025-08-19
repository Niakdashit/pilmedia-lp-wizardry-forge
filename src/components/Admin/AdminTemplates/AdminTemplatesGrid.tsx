import React from 'react';
import AdminTemplateCard, { GameTemplate } from './AdminTemplateCard';

interface AdminTemplatesGridProps {
  templates: GameTemplate[];
  onUse?: (template: GameTemplate) => void;
  variant?: 'shape' | 'compact' | 'standard';
}

const AdminTemplatesGrid: React.FC<AdminTemplatesGridProps> = ({ templates, onUse, variant = 'compact' }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-y-4 sm:gap-y-6 lg:gap-y-6 gap-x-1 sm:gap-x-1 lg:gap-x-1 [grid-auto-flow:dense]">
      {templates.map((template) => {
        // Equal height is enforced inside the card via TEMPLATE_TILE_HEIGHT_CLASS
        // We only vary width here based on orientation
        const base = 'col-span-2'; // mobile: each takes a full row (2 cols)
        // Aim: portrait ≈ carré (1:1), landscape ≈ 16:9
        // sm: portrait 2/6, landscape 4/6 (ratio ~2x width)
        // lg: portrait 4/12, landscape 7/12 (ratio ~1.75x width)
        const spanPortrait = 'sm:col-span-2 lg:col-span-4';
        const spanLandscape = 'sm:col-span-4 lg:col-span-7';
        const span = template.orientation === 'landscape' ? spanLandscape : spanPortrait;
        return (
          <div key={template.id} className={`${base} ${span}`}>
            <AdminTemplateCard template={template} onUse={onUse} variant={variant} />
          </div>
        );
      })}
    </div>
  );
};

export default AdminTemplatesGrid;

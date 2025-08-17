import React from 'react';
import AdminTemplateCard, { GameTemplate } from './AdminTemplateCard';

interface AdminTemplatesGridProps {
  templates: GameTemplate[];
  onUse?: (template: GameTemplate) => void;
}

const AdminTemplatesGrid: React.FC<AdminTemplatesGridProps> = ({ templates, onUse }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {templates.map((template) => (
        <AdminTemplateCard key={template.id} template={template} onUse={onUse} />
      ))}
    </div>
  );
};

export default AdminTemplatesGrid;

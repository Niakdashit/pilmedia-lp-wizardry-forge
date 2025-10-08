import React from 'react';
import type { DesignBlocCarte as BlocCarte } from '@/types/designEditorModular';

interface CartePanelProps {
  module: BlocCarte;
  onUpdate: (id: string, patch: Partial<BlocCarte>) => void;
  onAddChild?: (parentId: string, childModule: any) => void;
  onDeleteChild?: (parentId: string, childId: string) => void;
}

const CartePanel: React.FC<CartePanelProps> = ({ module, onUpdate }) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(module.id, { description: e.target.value });
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { cardBackground: e.target.value });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { textColor: e.target.value });
  };

  const handleBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { cardBorderColor: e.target.value });
  };

  const handleBorderWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { cardBorderWidth: parseInt(e.target.value) || 0 });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { cardRadius: parseInt(e.target.value) || 0 });
  };

  const handlePaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { padding: parseInt(e.target.value) || 0 });
  };

  const handleMaxWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(module.id, { maxWidth: parseInt(e.target.value) || 600 });
  };
  

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 space-y-6">
      {/* Titre */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Titre</h3>
        <input
          type="text"
          value={module.title || ''}
          onChange={handleTitleChange}
          placeholder="Titre de la carte"
          className="w-full px-3 py-2 text-sm border border-[hsl(var(--sidebar-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* Description */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Description</h3>
        <textarea
          value={module.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Description de la carte"
          rows={3}
          className="w-full px-3 py-2 text-sm border border-[hsl(var(--sidebar-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* Couleur de fond */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Couleur de fond</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={module.cardBackground || '#ffffff'}
            onChange={handleBackgroundChange}
            className="w-10 h-8 rounded border border-gray-300"
          />
          <input
            type="text"
            value={module.cardBackground || '#ffffff'}
            onChange={handleBackgroundChange}
            className="flex-1 text-xs px-2 py-1 border rounded"
          />
        </div>
      </section>

      {/* Couleur du texte */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Couleur du texte</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={module.textColor || '#1f2937'}
            onChange={handleTextColorChange}
            className="w-10 h-8 rounded border border-gray-300"
          />
          <input
            type="text"
            value={module.textColor || '#1f2937'}
            onChange={handleTextColorChange}
            className="flex-1 text-xs px-2 py-1 border rounded"
          />
        </div>
      </section>

      {/* Bordure */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Bordure</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[hsl(var(--sidebar-text))] w-20">Couleur</label>
            <input
              type="color"
              value={module.cardBorderColor || '#e5e7eb'}
              onChange={handleBorderColorChange}
              className="w-10 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={module.cardBorderColor || '#e5e7eb'}
              onChange={handleBorderColorChange}
              className="flex-1 text-xs px-2 py-1 border rounded"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-[hsl(var(--sidebar-text))] w-20">Épaisseur</label>
            <input
              type="range"
              min="0"
              max="10"
              value={module.cardBorderWidth || 1}
              onChange={handleBorderWidthChange}
              className="flex-1"
            />
            <span className="text-xs text-[hsl(var(--sidebar-text))] w-12">{module.cardBorderWidth || 1}px</span>
          </div>
        </div>
      </section>

      {/* Arrondi */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Arrondi des coins</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="50"
            value={module.cardRadius || 12}
            onChange={handleRadiusChange}
            className="flex-1"
          />
          <span className="text-xs text-[hsl(var(--sidebar-text))] w-12">{module.cardRadius || 12}px</span>
        </div>
      </section>

      {/* Padding */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Espacement interne</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={module.padding || 24}
            onChange={handlePaddingChange}
            className="flex-1"
          />
          <span className="text-xs text-[hsl(var(--sidebar-text))] w-12">{module.padding || 24}px</span>
        </div>
      </section>

      {/* Largeur max */}
      <section>
        <h3 className="text-sm font-semibold mb-2 text-[hsl(var(--sidebar-text-primary))]">Largeur maximale</h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="300"
            max="1000"
            step="50"
            value={module.maxWidth || 600}
            onChange={handleMaxWidthChange}
            className="flex-1"
          />
          <span className="text-xs text-[hsl(var(--sidebar-text))] w-16">{module.maxWidth || 600}px</span>
        </div>
      </section>
    </div>
  );
};

export default CartePanel;

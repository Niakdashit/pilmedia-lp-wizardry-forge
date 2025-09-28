import React from 'react';
import type { SectionLayout } from '@/types/modularEditor';

interface SectionLayoutsPanelProps {
  onSelectLayout: (layout: SectionLayout) => void;
}

const tiles: Array<{ id: SectionLayout; label: string; desc: string }> = [
  { id: '1', label: '1', desc: '1 colonne' },
  { id: '2', label: '2', desc: '2 colonnes' },
  { id: '3', label: '3', desc: '3 colonnes (desktop), 2 max sur mobile' },
  { id: '1-2', label: '1/3 : 2/3', desc: 'Asymétrique' },
  { id: '2-1', label: '2/3 : 1/3', desc: 'Asymétrique' }
];

const IconLayout: React.FC<{ id: SectionLayout }> = ({ id }) => {
  const base = 'h-2.5 rounded-sm border border-black/20 bg-white/70';
  switch (id) {
    case '1':
      return (
        <div className="flex items-center gap-1 mt-1" aria-hidden>
          <div className={`${base} w-14`} />
        </div>
      );
    case '2':
      return (
        <div className="flex items-center gap-1 mt-1" aria-hidden>
          <div className={`${base} w-6`} />
          <div className={`${base} w-6`} />
        </div>
      );
    case '3':
      return (
        <div className="flex items-center gap-1 mt-1" aria-hidden>
          <div className={`${base} w-4`} />
          <div className={`${base} w-4`} />
          <div className={`${base} w-4`} />
        </div>
      );
    case '1-2':
      return (
        <div className="flex items-center gap-1 mt-1" aria-hidden>
          <div className={`${base} w-5`} />
          <div className={`${base} w-9`} />
        </div>
      );
    case '2-1':
      return (
        <div className="flex items-center gap-1 mt-1" aria-hidden>
          <div className={`${base} w-9`} />
          <div className={`${base} w-5`} />
        </div>
      );
    default:
      return null;
  }
};

const SectionLayoutsPanel: React.FC<SectionLayoutsPanelProps> = ({ onSelectLayout }) => {
  const [selected, setSelected] = React.useState<SectionLayout>('1');
  return (
    <div className="px-4 py-3">
      <div className="text-xs uppercase tracking-wide mb-2 text-[hsl(var(--sidebar-text-primary))]/80">SECTIONS</div>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Layouts de section">
        {tiles.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSelected(t.id); onSelectLayout(t.id); }}
            role="radio"
            aria-checked={selected === t.id}
            className={`bg-[hsl(var(--sidebar-surface))] border rounded-xl p-3 text-left shadow-sm transition focus:outline-none ${
              selected === t.id
                ? 'border-[#b277c8] ring-2 ring-[#b277c8]/50'
                : 'border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-hover))] hover:border-white/30 focus:ring-2 focus:ring-[#841b60]/50'
            }`}
          >
            {/* Simple visual mock of the layout */}
            <div className="mb-3">
              <IconLayout id={t.id} />
            </div>
            <div className="text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">{t.label}</div>
            <div className="text-[11px] text-[hsl(var(--sidebar-text-primary))]/75">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
;

export default SectionLayoutsPanel;

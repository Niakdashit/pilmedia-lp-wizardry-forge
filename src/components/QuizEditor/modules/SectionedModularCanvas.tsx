import React from 'react';
import type { Section, Module } from '@/types/modularEditor';
import type { DeviceType } from '@/utils/deviceDimensions';
import { renderModule } from './ModularCanvas';

export interface SectionedModularCanvasProps {
  sections: Section[];
  device?: DeviceType;
  onUpdate: (id: string, patch: Partial<Module>) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string, direction: 'up' | 'down') => void;
  // Drag & drop between columns/sections
  onMoveModule?: (payload: {
    moduleId: string;
    fromSectionId: string;
    fromColumnIndex: number;
    fromIndex: number;
    toSectionId: string;
    toColumnIndex: number;
    toIndex: number;
  }) => void;
}

const getLayoutColumns = (layout: Section['layout']) => {
  switch (layout) {
    case '1': return 1;
    case '2': return 2;
    case '3': return 3;
    case '1-2': return 2;
    case '2-1': return 2;
    default: return 1;
  }
};

const getColumnBasisPercent = (layout: Section['layout'], index: number): string => {
  if (layout === '1') return '100%';
  if (layout === '2') return '50%';
  if (layout === '3') return '33.3333%';
  if (layout === '1-2') return index === 0 ? '33.3333%' : '66.6667%';
  if (layout === '2-1') return index === 0 ? '66.6667%' : '33.3333%';
  return '100%';
};

const SectionedModularCanvas: React.FC<SectionedModularCanvasProps> = ({ sections, device = 'desktop', onUpdate, onMoveModule }) => {
  const isMobile = device === 'mobile';
  const dragDataRef = React.useRef<{
    moduleId: string;
    sectionId: string;
    columnIndex: number;
    index: number;
  } | null>(null);

  return (
    <div className="w-full max-w-[1500px] mx-auto" data-modular-zone="1">
      {sections.map((section) => {
        const totalCols = getLayoutColumns(section.layout);
        const desktopCols = Math.max(1, Math.min(section.columnsDesktop ?? totalCols, totalCols, 3));
        const mobileCols = Math.max(1, Math.min(section.columnsMobile ?? Math.min(totalCols, 2), Math.min(totalCols, 2)));
        const gutter = section.gutter ?? 16;
        const paddingY = section.paddingY ?? 12;

        return (
          <div
            key={section.id}
            className="group/section w-full rounded-2xl border border-white/10 bg-white/5/[0.12] backdrop-blur-[1px] transition-all duration-200 hover:border-[#841b60]/40 hover:bg-[#841b60]/10"
            style={{ background: section.backgroundColor || 'transparent', paddingTop: paddingY, paddingBottom: paddingY, paddingLeft: gutter, paddingRight: gutter }}
          >
            {/* Grid wrapper. We use CSS grid to enforce responsive column limits. */}
            <div
              className="grid gap-x-4 gap-y-6 transition-all duration-200 group-hover/section:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              style={{
                gridTemplateColumns: isMobile
                  ? `repeat(${mobileCols}, minmax(0, 1fr))`
                  : `repeat(${desktopCols}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: totalCols }).map((_, colIdx) => {
                // On desktop, respect asymmetric widths by wrapping a column in a div with fixed basis.
                const basis = getColumnBasisPercent(section.layout, colIdx);
                const colModules = section.modules[colIdx] || [];
                const widthPercent = Number.isNaN(parseFloat(basis)) ? '' : `${Math.round(parseFloat(basis))}%`;

                return (
                  <div
                    key={`${section.id}-col-${colIdx}`}
                    className="group/column relative min-h-[160px] rounded-2xl border border-dashed border-white/10 bg-white/5/[0.12] p-2 transition-all duration-200 hover:border-[#841b60]/70 hover:bg-[#841b60]/10"
                    style={isMobile ? undefined : { minWidth: 0, flexBasis: basis }}
                    onDragOver={(e) => {
                      if (!onMoveModule) return;
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      if (!onMoveModule) return;
                      e.preventDefault();
                      const raw = e.dataTransfer.getData('application/x-modular-module');
                      if (!raw) return;
                      try {
                        const data = JSON.parse(raw) as { moduleId: string; sectionId: string; columnIndex: number; index: number };
                        // Compute drop index based on mouse Y relative to items
                        const container = e.currentTarget as HTMLDivElement;
                        const children = Array.from(container.children) as HTMLElement[];
                        let toIndex = colModules.length;
                        for (let i = 0; i < children.length; i++) {
                          const rect = children[i].getBoundingClientRect();
                          if (e.clientY < rect.top + rect.height / 2) {
                            toIndex = i;
                            break;
                          }
                        }
                        onMoveModule({
                          moduleId: data.moduleId,
                          fromSectionId: data.sectionId,
                          fromColumnIndex: data.columnIndex,
                          fromIndex: data.index,
                          toColumnIndex: colIdx,
                          toIndex
                        });
                      } catch {}
                    }}
                    >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover/column:opacity-100 group-hover/column:shadow-[0_0_0_1px_RGBA(132,27,96,0.35)] before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:border before:border-transparent group-hover/column:before:border-[#841b60]/60" />
                    <div className="pointer-events-none absolute top-3 left-4 text-[11px] font-medium uppercase tracking-wide text-white/50 group-hover/column:text-white/90">
                      {`Colonne ${colIdx + 1}${widthPercent ? ` • ${widthPercent}` : ''}`}
                    </div>
                    {colModules.length === 0 && (
                      <div className="pointer-events-none absolute inset-6 flex items-center justify-center rounded-xl border border-dashed border-white/20 text-xs font-medium text-white/40 transition-colors duration-200 group-hover/column:border-[#841b60]/60 group-hover/column:text-white/80">
                        Glissez un module ici
                      </div>
                    )}
                    {/* Stack modules vertically inside column */}
                    {colModules.map((m, mIdx) => (
                      <div
                        key={m.id}
                        className="relative z-10 mt-3 first:mt-0"
                        draggable={!!onMoveModule}
                        onDragStart={(e) => {
                          if (!onMoveModule) return;
                          const payload = {
                            moduleId: m.id,
                            columnIndex: colIdx,
                            index: mIdx
                          };
                          dragDataRef.current = payload;
                          e.dataTransfer.setData('application/x-modular-module', JSON.stringify(payload));
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        {renderModule(m, (patch) => onUpdate(m.id, patch), device)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectionedModularCanvas;

import {
  TEMPLATE_GRID_COLS,
  TEMPLATE_PC_COL_SPAN,
  TEMPLATE_MOBILE_COL_SPAN,
  TEMPLATE_TILE_HEIGHT_CLASS,
  TEMPLATE_TILE_RADIUS_CLASS,
  TEMPLATE_TILE_BG_CLASS,
} from "../config/templateThumb";

export type TemplateKind = "desktop" | "mobile";

export type TemplateItem = {
  id: string;
  title: string;
  coverUrl: string;
  // facultatif: forcer un format au lieu de l’alternance
  kind?: TemplateKind;
};

export function TemplateGallery({
  items,
  onSelect,
}: {
  items: TemplateItem[];
  onSelect?: (item: TemplateItem) => void;
}) {
  // Fixed 24-column grid spans to match the screenshot exactly
  // Row 1: 4 tiles -> [10, 6, 4, 4] (sum 24)
  // Row 2: 5 tiles -> [10, 4, 4, 3, 3] (sum 24)
  const SHAPES_SPANS: number[] = [10, 6, 4, 4, 10, 4, 4, 3, 3];

  const getGridColumnStyle = (span: number) => ({ gridColumn: `span ${span} / span ${span}` });

  // Use only the 2nd and the last shapes
  const SELECTED_INDEXES = [1, SHAPES_SPANS.length - 1];
  const nodes = SELECTED_INDEXES.map((idx) => {
    // Force exact standardized spans
    let span = idx === 1 ? TEMPLATE_PC_COL_SPAN : TEMPLATE_MOBILE_COL_SPAN;
    const item = items[idx];
    const clickable = Boolean(item && onSelect);
    // Equal height for both desktop and mobile based on shared config
    const heightClass = TEMPLATE_TILE_HEIGHT_CLASS;
    return (
      <button
        key={item?.id ?? `placeholder-${idx}`}
        onClick={clickable ? () => onSelect?.(item!) : undefined}
        aria-label={clickable ? `Ouvrir le modèle ${item!.title}` : undefined}
        className={`group relative w-full transition-none focus:outline-none ${clickable ? 'focus:ring-2 focus:ring-primary-600/60 cursor-pointer' : 'cursor-default'}`}
        style={getGridColumnStyle(span)}
      >
        <div
          className={[
            'w-full',
            'relative overflow-hidden',
            heightClass,
            `${TEMPLATE_TILE_RADIUS_CLASS} ${TEMPLATE_TILE_BG_CLASS}`
          ].join(' ')}
        />
      </button>
    );
  });
  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: `repeat(${TEMPLATE_GRID_COLS}, minmax(0, 1fr))` }}
    >
      {nodes}
    </div>
  );
}

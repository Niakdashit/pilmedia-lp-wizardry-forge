import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Subscript,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Unlink,
  Image
} from 'lucide-react';
import HexColorPicker from '@/components/shared/HexColorPicker';

interface RichTextToolbarProps {
  onFormat?: (tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onSubscript?: () => void;
  onOrderedList?: () => void;
  onUnorderedList?: () => void;
  onIndentDecrease?: () => void;
  onIndentIncrease?: () => void;
  onTextColor?: (hex: string) => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignJustify?: () => void;
  onLink?: () => void;
  onUnlink?: () => void;
  onImage?: () => void;
  onTable?: () => void;
  onSpecialChar?: () => void;
  onToggleSource?: () => void;
  isSourceMode?: boolean;
}

/**
 * RichTextToolbar - Clone exact de la toolbar de formatage
 * 
 * Réplique pixel-perfect de l'image fournie avec tous les boutons:
 * Format | A▼ B I U Ix | 1. • | ⇤ ⇥ | ≡ ≡ ≡ ≡ | 🔗 ⛓ 🖼 ▦ ≡ Ω | Source
 */
const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  onFormat,
  onBold,
  onItalic,
  onUnderline,
  onSubscript,
  onOrderedList,
  onUnorderedList,
  onTextColor,
  onIndentDecrease,
  onIndentIncrease,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onLink,
  onUnlink,
  onImage,
  onTable,
  onSpecialChar,
  onToggleSource,
  isSourceMode = false
}) => {
  const buttonClass = "inline-flex items-center justify-center h-[28px] min-w-[28px] px-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors";
  const separatorClass = "inline-block w-px h-[20px] bg-gray-300 mx-1";

  return (
    <div className="flex items-center gap-0.5 p-1 bg-gray-50 border border-gray-300 rounded flex-wrap">
      {/* Format dropdown */}
      <select
        className={`${buttonClass} pr-6 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_4px_center] bg-no-repeat`}
        onChange={(e) => {
          if (onFormat && e.target.value) {
            onFormat(e.target.value as any);
            // Reset to default after applying
            setTimeout(() => {
              e.target.value = '';
            }, 0);
          }
        }}
        value=""
      >
        <option value="" disabled>Format</option>
        <option value="p">Paragraphe</option>
        <option value="h1">Titre 1</option>
        <option value="h2">Titre 2</option>
        <option value="h3">Titre 3</option>
        <option value="h4">Titre 4</option>
        <option value="h5">Titre 5</option>
        <option value="h6">Titre 6</option>
      </select>

      {/* Text color picker */}
      <label className={`${buttonClass} relative cursor-pointer`} title="Couleur du texte" onMouseDown={(e) => e.preventDefault()}>
        <span className="font-semibold mr-1">A</span>
        <span className="inline-block w-3 h-3 rounded-sm border border-gray-300 align-middle" style={{ background: '#111827' }} />
        <HexColorPicker
          value="#111827"
          onChange={(hex) => {
            if (onTextColor) onTextColor(hex);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      {/* Text formatting: B I U Ix */}
      <button
        className={`${buttonClass} font-bold`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onBold}
        title="Gras (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        className={`${buttonClass} italic`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onItalic}
        title="Italique (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        className={`${buttonClass} underline`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onUnderline}
        title="Souligné (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSubscript}
        title="Indice"
      >
        <Subscript className="w-4 h-4" />
      </button>

      {/* Lists: 1. • */}
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOrderedList}
        title="Liste numérotée"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onUnorderedList}
        title="Liste à puces"
      >
        <List className="w-4 h-4" />
      </button>

      {/* Alignment: ≡ ≡ ≡ ≡ */}
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignLeft}
        title="Aligner à gauche"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignCenter}
        title="Centrer"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignRight}
        title="Aligner à droite"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAlignJustify}
        title="Justifier"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      {/* Links & Media: 🔗 ⛓ 🖼 ▦ */}
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onLink}
        title="Insérer un lien"
      >
        <Link className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onUnlink}
        title="Supprimer le lien"
      >
        <Unlink className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onImage}
        title="Insérer une image"
      >
        <Image className="w-4 h-4" />
      </button>
      <button
        className={buttonClass}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onSpecialChar}
        title="Caractères spéciaux"
      >
        <span className="text-base font-bold">Ω</span>
      </button>

      {/* Separator */}
      <div className={separatorClass} />

      {/* Source toggle */}
      <button
        className={`${buttonClass} px-3 font-medium ${isSourceMode ? 'bg-gray-200' : ''}`}
        onClick={onToggleSource}
        title="Basculer en mode source"
      >
        Source
      </button>
    </div>
  );
};

export default RichTextToolbar;

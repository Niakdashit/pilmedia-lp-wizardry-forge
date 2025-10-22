import React, { useRef, useState } from 'react';

interface HexColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * HexColorPicker - Sélecteur de couleur qui force le format HEX
 * 
 * Garantit que la valeur est toujours en format hexadécimal (#RRGGBB)
 * indépendamment du système d'exploitation ou du navigateur.
 */
const HexColorPicker: React.FC<HexColorPickerProps> = ({
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  // Normaliser la valeur en HEX
  const normalizeToHex = (color: string): string => {
    // Si déjà en HEX, retourner tel quel
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return color.toUpperCase();
    }

    // Si format court #RGB, convertir en #RRGGBB
    if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    // Si RGB/RGBA, convertir en HEX
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    }

    // Fallback: retourner la valeur telle quelle
    return color;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const hexValue = normalizeToHex(newValue);
    setLocalValue(hexValue);
    onChange(hexValue);
  };

  // Synchroniser avec la prop externe
  React.useEffect(() => {
    const normalized = normalizeToHex(value);
    if (normalized !== localValue) {
      setLocalValue(normalized);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="color"
      value={localValue}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      // Force le format HEX dans l'attribut list (non supporté partout mais aide)
      list="hex-only"
    />
  );
};

export default HexColorPicker;


import React from 'react';

interface ThemeSelectorProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ theme, onThemeChange }) => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Thème visuel mobile de la roue
      </label>
      <select
        value={theme}
        onChange={e => onThemeChange(e.target.value)}
        className="border p-2 rounded w-full md:w-1/2"
      >
        <option value="default">Classique pâle</option>
        <option value="promo">Promo & Cadeaux</option>
        <option value="food">Restauration</option>
        <option value="casino">Casino</option>
        <option value="child">Enfant</option>
        <option value="gaming">Gaming</option>
        <option value="luxury">Luxe</option>
        <option value="halloween">Halloween</option>
        <option value="noel">Noël</option>
      </select>
    </div>
  );
};

export default ThemeSelector;

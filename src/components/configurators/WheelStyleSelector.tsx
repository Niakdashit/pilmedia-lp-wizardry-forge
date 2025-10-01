import React from 'react';

interface WheelStyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

const wheelStyles = [
  { label: '🎰 Casino', file: 'roulette_casino.svg' },
  { label: '✨ Luxe', file: 'roulette_luxury.svg' },
  { label: '🎃 Halloween', file: 'roulette_halloween.svg' },
  { label: '🎄 Noël', file: 'roulette_noel.svg' },
];

const WheelStyleSelector: React.FC<WheelStyleSelectorProps> = ({ selectedStyle, setSelectedStyle }) => {
  return (
    <div>
      <h3 className="text-md font-semibold mb-2">Style de la roue</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {wheelStyles.map(({ label, file }) => (
          <div
            key={file}
            onClick={() => setSelectedStyle(file)}
            className={`border p-2 rounded-lg cursor-pointer hover:shadow-md transition ${
              selectedStyle === file ? 'border-[#d4dbe8] ring-2 ring-[#d4dbe8]' : 'border-gray-300'
            }`}
          >
            <img
              src={`/assets/roues/${file}`}
              alt={label}
              className="w-full h-24 object-contain mb-2"
            />
            <p className="text-center text-sm">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelStyleSelector;

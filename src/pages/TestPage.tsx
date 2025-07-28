import React from 'react';

const fonts = [
  // Artistic Display Fonts
  'Abril Fatface', 'Alegreya SC', 'Alfa Slab One', 'Anton', 'Arvo', 'Barlow Condensed', 'Bebas Neue', 'Big Shoulders Display', 'Calistoga', 'Catamaran', 'Creepster', 'Crimson Text', 'DM Serif Display', 'Domine', 'Exo', 'Fjalla One', 'Francois One', 'Fredoka One', 'Gelasio', 'Gravitas One', 'Hammersmith One', 'IBM Plex Serif', 'Josefin Sans', 'Kalam', 'Kanit', 'Lalezar', 'Lexend', 'Libre Baskerville', 'Lilita One', 'Lobster', 'Lora', 'Merriweather', 'Montserrat Alternates', 'Noto Serif', 'Nunito Sans', 'Old Standard TT', 'Oswald', 'Patua One', 'Playfair Display', 'Poppins', 'PT Serif', 'Quattrocento', 'Raleway', 'Righteous', 'Roboto Condensed', 'Roboto Slab', 'Russo One', 'Saira', 'Source Serif Pro', 'Spectral', 'Squada One', 'Staatliches', 'Titillium Web', 'Ubuntu', 'Ultra', 'Vollkorn', 'Work Sans', 'Yeseva One', 'Zilla Slab',

  // Handwriting & Script
  'Amatic SC', 'Architects Daughter', 'Caveat', 'Cookie', 'Dancing Script', 'Great Vibes', 'Indie Flower', 'Kaushan Script', 'Lobster Two', 'Pacifico', 'Patrick Hand', 'Permanent Marker', 'Rock Salt', 'Sacramento', 'Satisfy', 'Shadows Into Light', 'Yellowtail',

  // Decorative & Stylized
  'Bangers', 'Black Ops One', 'Bungee', 'Bungee Shade', 'Cinzel', 'Comfortaa', 'Covered By Your Grace', 'Faster One', 'Fontdiner Swanky', 'Griffy', 'Henny Penny', 'Indie Flower', 'Luckiest Guy', 'Metal Mania', 'Modak', 'Nosifer', 'Orbitron', 'Press Start 2P', 'Rajdhani', 'Righteous', 'Shrikhand', 'Special Elite', 'Titan One', 'Trade Winds', 'Wallpoet',

  // Modern & Trendy
  'Barlow', 'DM Sans', 'Epilogue', 'Fira Sans', 'Inter', 'JetBrains Mono', 'Karla', 'Lato', 'Manrope', 'Mulish', 'Open Sans', 'Plus Jakarta Sans', 'Roboto', 'Rubik', 'Space Grotesk', 'Space Mono'
];

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Panel des polices à gauche */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Google Fonts Artistiques</h2>
        <p className="text-sm text-gray-600 mb-6">Cliquez sur une police pour voir l'aperçu</p>
        
        <div className="space-y-2">
          {fonts.map((font, index) => (
            <button
              key={index}
              onClick={() => {
                const previewArea = document.getElementById('preview-area');
                if (previewArea) {
                  previewArea.style.fontFamily = font;
                  previewArea.textContent = `Aperçu avec ${font}`;
                }
              }}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div style={{ fontFamily: font }} className="text-base">
                {font}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Exemple de texte
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone d'aperçu blanche */}
      <div className="flex-1 p-8 flex items-center justify-center">
        <div 
          id="preview-area"
          className="text-4xl text-gray-800 text-center max-w-2xl"
          style={{ fontFamily: 'Inter' }}
        >
          Sélectionnez une police dans le panel pour voir l'aperçu
        </div>
      </div>
    </div>
  );
};

export default TestPage;
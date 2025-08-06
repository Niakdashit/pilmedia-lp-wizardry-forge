import React from 'react';

// Polices organisées par catégories - Toutes les nouvelles polices ajoutées
const fontCategories = [{
  name: "Business",
  fonts: [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Nunito Sans', 'Inter', 'Poppins', 'Work Sans', 'IBM Plex Sans',
    // Nouvelles polices business modernes
    'DM Sans', 'Plus Jakarta Sans', 'Manrope', 'Space Grotesk', 'Outfit', 'Lexend', 'Sora', 'Red Hat Display', 'Figtree', 'Onest',
    'Geist Sans', 'Albert Sans', 'Be Vietnam Pro', 'Epilogue', 'Satoshi', 'Urbanist', 'Cabinet Grotesk', 'General Sans'
  ]
}, {
  name: "Calm",
  fonts: [
    'Libre Baskerville', 'Crimson Text', 'EB Garamond', 'Lora', 'Merriweather', 'Playfair Display', 'Cormorant Garamond', 'Spectral', 'Source Serif Pro', 'Vollkorn',
    // Nouvelles polices calmes et sereines
    'Fraunces', 'Newsreader', 'Literata', 'Crimson Pro', 'Libre Caslon Text', 'Zilla Slab', 'Bitter', 'Alegreya', 'Neuton', 'Gentium Plus',
    'Cardo', 'Domine', 'Arvo', 'Rokkitt', 'Slabo 27px', 'PT Serif', 'Droid Serif', 'Noto Serif'
  ]
}, {
  name: "Cute",
  fonts: [
    'Caveat', 'Indie Flower', 'Architects Daughter', 'Shadows Into Light', 'Covered By Your Grace', 'Handlee', 'Kalam', 'Coming Soon', 'Sue Ellen Francisco', 'Schoolbell',
    // Nouvelles polices mignonnes et amicales
    'Quicksand', 'Comfortaa', 'Nunito', 'Rubik', 'Varela Round', 'Fredoka', 'Baloo 2', 'Dosis', 'Livvic', 'Hind',
    'Karla', 'Assistant', 'Mukti', 'Catamaran', 'Muli', 'Oxygen', 'Ubuntu', 'Cabin', 'Lato', 'Raleway'
  ]
}, {
  name: "Fancy",
  fonts: [
    'Cinzel', 'Cormorant', 'Abril Fatface', 'Yeseva One', 'Fredericka the Great', 'Almendra', 'UnifrakturMaguntia', 'Cardo', 'Old Standard TT', 'Libre Caslon Text',
    // Nouvelles polices élégantes et sophistiquées
    'Bodoni Moda', 'Italiana', 'Tenor Sans', 'Marcellus', 'Forum', 'Philosopher', 'Sorts Mill Goudy', 'Bentham', 'Caudex', 'Fanwood Text',
    'Gilda Display', 'Judson', 'Linden Hill', 'Radley', 'Rufina', 'Vidaloka', 'Amiri', 'Cormorant Upright', 'Enriqueta', 'Trajan Pro'
  ]
}, {
  name: "Playful",
  fonts: [
    'Lobster', 'Pacifico', 'Fredoka One', 'Righteous', 'Bungee', 'Chewy', 'Leckerli One', 'Creepster', 'Sigmar One', 'Shrikhand',
    // Nouvelles polices ludiques et amusantes
    'Bowlby One', 'Titan One', 'Bungee Shade', 'Modak', 'Orbitron', 'Press Start 2P', 'Bangers', 'Kalam', 'Griffy', 'Luckiest Guy',
    'Lilita One', 'Bree Serif', 'Bungee Inline', 'Faster One', 'Fascinate', 'Fontdiner Swanky', 'Jolly Lodger', 'Nosifer', 'Rye', 'Special Elite'
  ]
}, {
  name: "Artistic",
  fonts: [
    'Dancing Script', 'Great Vibes', 'Allura', 'Satisfy', 'Kaushan Script', 'Tangerine', 'Sacramento', 'Yellowtail', 'Pinyon Script', 'Marck Script', 'Amatic SC', 'Permanent Marker', 'Homemade Apple', 'Rock Salt',
    // Nouvelles polices artistiques et créatives
    'Parisienne', 'Alex Brush', 'Courgette', 'Grand Hotel', 'Kalam', 'Lobster Two', 'Marmelad', 'Neucha', 'Pangolin', 'Patrick Hand',
    'Reenie Beanie', 'Shadows Into Light Two', 'Short Stack', 'Walter Turncoat', 'Zeyada', 'Bad Script', 'Caveat Brush', 'Dawning of a New Day', 'Delius', 'Gloria Hallelujah'
  ]
}];

const FontTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test des Polices Google Fonts</h1>
          <p className="text-lg text-gray-600">Vérification visuelle de toutes les polices chargées dans Prosplay</p>
          <div className="mt-4 text-sm text-gray-500">
            Total: {fontCategories.reduce((acc, cat) => acc + cat.fonts.length, 0)} polices disponibles
          </div>
        </div>

        {fontCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {category.fonts.length} polices
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.fonts.map((font, fontIndex) => (
                  <div key={fontIndex} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 font-mono">{font}</span>
                    </div>
                    <div 
                      className="text-xl text-gray-900 mb-2"
                      style={{ fontFamily: font }}
                    >
                      The quick brown fox jumps
                    </div>
                    <div 
                      className="text-sm text-gray-600"
                      style={{ fontFamily: font }}
                    >
                      Prosplay - Design Editor
                    </div>
                    <div 
                      className="text-xs text-gray-400 mt-1"
                      style={{ fontFamily: font }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="text-center mt-12 p-6 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Test de Rendu Complet</h3>
          <p className="text-green-700">
            Si toutes les polices ci-dessus s'affichent correctement avec leurs styles uniques, 
            l'intégration Google Fonts est réussie !
          </p>
        </div>
      </div>
    </div>
  );
};

export default FontTest;

import React, { useState, useRef, useCallback } from 'react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

const fontCategories = [
  {
    name: "Business",
    fonts: [
      { name: 'Roboto', className: 'font-roboto' },
      { name: 'Open Sans', className: 'font-open-sans' },
      { name: 'Lato', className: 'font-lato' },
      { name: 'Montserrat', className: 'font-montserrat' },
      { name: 'Source Sans Pro', className: 'font-source-sans-pro' },
      { name: 'Nunito Sans', className: 'font-nunito-sans' },
      { name: 'Inter', className: 'font-inter' },
      { name: 'Poppins', className: 'font-poppins' },
      { name: 'Work Sans', className: 'font-work-sans' },
      { name: 'IBM Plex Sans', className: 'font-ibm-plex-sans' }
    ]
  },
  {
    name: "Calm",
    fonts: [
      { name: 'Libre Baskerville', className: 'font-libre-baskerville' },
      { name: 'Crimson Text', className: 'font-crimson-text' },
      { name: 'EB Garamond', className: 'font-eb-garamond' },
      { name: 'Lora', className: 'font-lora' },
      { name: 'Merriweather', className: 'font-merriweather' },
      { name: 'Playfair Display', className: 'font-playfair-display' },
      { name: 'Cormorant Garamond', className: 'font-cormorant-garamond' },
      { name: 'Spectral', className: 'font-spectral' },
      { name: 'Source Serif Pro', className: 'font-source-serif-pro' },
      { name: 'Vollkorn', className: 'font-vollkorn' }
    ]
  },
  {
    name: "Cute",
    fonts: [
      { name: 'Caveat', className: 'font-caveat' },
      { name: 'Indie Flower', className: 'font-indie-flower' },
      { name: 'Architects Daughter', className: 'font-architects-daughter' },
      { name: 'Shadows Into Light', className: 'font-shadows-into-light' },
      { name: 'Covered By Your Grace', className: 'font-covered-by-your-grace' },
      { name: 'Handlee', className: 'font-handlee' },
      { name: 'Kalam', className: 'font-kalam' },
      { name: 'Coming Soon', className: 'font-coming-soon' },
      { name: 'Sue Ellen Francisco', className: 'font-sue-ellen-francisco' },
      { name: 'Schoolbell', className: 'font-schoolbell' }
    ]
  },
  {
    name: "Fancy",
    fonts: [
      { name: 'Cinzel', className: 'font-cinzel' },
      { name: 'Cormorant', className: 'font-cormorant' },
      { name: 'Abril Fatface', className: 'font-abril-fatface' },
      { name: 'Yeseva One', className: 'font-yeseva-one' },
      { name: 'Fredericka the Great', className: 'font-fredericka-the-great' },
      { name: 'Almendra', className: 'font-almendra' },
      { name: 'UnifrakturMaguntia', className: 'font-unifraktur-maguntia' },
      { name: 'Cardo', className: 'font-cardo' },
      { name: 'Old Standard TT', className: 'font-old-standard-tt' },
      { name: 'Libre Caslon Text', className: 'font-libre-caslon-text' }
    ]
  },
  {
    name: "Playful",
    fonts: [
      { name: 'Lobster', className: 'font-lobster' },
      { name: 'Pacifico', className: 'font-pacifico' },
      { name: 'Fredoka One', className: 'font-fredoka-one' },
      { name: 'Righteous', className: 'font-righteous' },
      { name: 'Bungee', className: 'font-bungee' },
      { name: 'Chewy', className: 'font-chewy' },
      { name: 'Leckerli One', className: 'font-leckerli-one' },
      { name: 'Creepster', className: 'font-creepster' },
      { name: 'Sigmar One', className: 'font-sigmar-one' },
      { name: 'Shrikhand', className: 'font-shrikhand' }
    ]
  },
  {
    name: "Artistic",
    fonts: [
      { name: 'Dancing Script', className: 'font-dancing-script' },
      { name: 'Great Vibes', className: 'font-great-vibes' },
      { name: 'Allura', className: 'font-allura' },
      { name: 'Satisfy', className: 'font-satisfy' },
      { name: 'Kaushan Script', className: 'font-kaushan-script' },
      { name: 'Tangerine', className: 'font-tangerine' },
      { name: 'Sacramento', className: 'font-sacramento' },
      { name: 'Yellowtail', className: 'font-yellowtail' },
      { name: 'Pinyon Script', className: 'font-pinyon-script' },
      { name: 'Marck Script', className: 'font-marck-script' },
      { name: 'Amatic SC', className: 'font-amatic-sc' },
      { name: 'Permanent Marker', className: 'font-permanent-marker' },
      { name: 'Homemade Apple', className: 'font-homemade-apple' },
      { name: 'Rock Salt', className: 'font-rock-salt' }
    ]
  }
];

// Flatten all fonts for easy access
const allFonts = fontCategories.flatMap(category => category.fonts);

const TestPage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [currentFont, setCurrentFont] = useState(allFonts[0]);
  const [currentCategory, setCurrentCategory] = useState(fontCategories[0]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const textCounter = useRef(0);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const addTextElement = useCallback((x?: number, y?: number) => {
    textCounter.current += 1;
    const newElement: TextElement = {
      id: `text-${textCounter.current}`,
      text: 'Cliquez pour éditer',
      x: x ?? 100 + Math.random() * 200,
      y: y ?? 100 + Math.random() * 200,
      fontSize: 24,
      color: '#000000',
      fontFamily: currentFont.className
    };
    
    setTextElements(prev => [...prev, newElement]);
    setActiveElement(newElement.id);
  }, [currentFont]);

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteTextElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    setActiveElement(null);
  };

  const clearCanvas = () => {
    setTextElements([]);
    setActiveElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = textElements.find(el => el.id === elementId);
    if (!element) return;

    setActiveElement(elementId);
    setDraggedElement(elementId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    updateTextElement(draggedElement, { x: newX, y: newY });
  }, [draggedElement, dragOffset]);

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addTextElement(x, y);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setActiveElement(null);
    }
  };

  const activeElementData = textElements.find(el => el.id === activeElement);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <style>{`
        /* Business Fonts */
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }
        .font-lato { font-family: 'Lato', sans-serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-source-sans-pro { font-family: 'Source Sans Pro', sans-serif; }
        .font-nunito-sans { font-family: 'Nunito Sans', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-work-sans { font-family: 'Work Sans', sans-serif; }
        .font-ibm-plex-sans { font-family: 'IBM Plex Sans', sans-serif; }
        
        /* Calm Fonts */
        .font-libre-baskerville { font-family: 'Libre Baskerville', serif; }
        .font-crimson-text { font-family: 'Crimson Text', serif; }
        .font-eb-garamond { font-family: 'EB Garamond', serif; }
        .font-lora { font-family: 'Lora', serif; }
        .font-merriweather { font-family: 'Merriweather', serif; }
        .font-playfair-display { font-family: 'Playfair Display', serif; }
        .font-cormorant-garamond { font-family: 'Cormorant Garamond', serif; }
        .font-spectral { font-family: 'Spectral', serif; }
        .font-source-serif-pro { font-family: 'Source Serif Pro', serif; }
        .font-vollkorn { font-family: 'Vollkorn', serif; }
        
        /* Cute Fonts */
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-indie-flower { font-family: 'Indie Flower', cursive; }
        .font-architects-daughter { font-family: 'Architects Daughter', cursive; }
        .font-shadows-into-light { font-family: 'Shadows Into Light', cursive; }
        .font-covered-by-your-grace { font-family: 'Covered By Your Grace', cursive; }
        .font-handlee { font-family: 'Handlee', cursive; }
        .font-kalam { font-family: 'Kalam', cursive; }
        .font-coming-soon { font-family: 'Coming Soon', cursive; }
        .font-sue-ellen-francisco { font-family: 'Sue Ellen Francisco', cursive; }
        .font-schoolbell { font-family: 'Schoolbell', cursive; }
        
        /* Fancy Fonts */
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-cormorant { font-family: 'Cormorant', serif; }
        .font-abril-fatface { font-family: 'Abril Fatface', serif; }
        .font-yeseva-one { font-family: 'Yeseva One', serif; }
        .font-fredericka-the-great { font-family: 'Fredericka the Great', cursive; }
        .font-almendra { font-family: 'Almendra', serif; }
        .font-unifraktur-maguntia { font-family: 'UnifrakturMaguntia', cursive; }
        .font-cardo { font-family: 'Cardo', serif; }
        .font-old-standard-tt { font-family: 'Old Standard TT', serif; }
        .font-libre-caslon-text { font-family: 'Libre Caslon Text', serif; }
        
        /* Playful Fonts */
        .font-lobster { font-family: 'Lobster', cursive; }
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-fredoka-one { font-family: 'Fredoka One', cursive; }
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-bungee { font-family: 'Bungee', cursive; }
        .font-chewy { font-family: 'Chewy', cursive; }
        .font-leckerli-one { font-family: 'Leckerli One', cursive; }
        .font-creepster { font-family: 'Creepster', cursive; }
        .font-sigmar-one { font-family: 'Sigmar One', cursive; }
        .font-shrikhand { font-family: 'Shrikhand', cursive; }
        
        /* Artistic Fonts */
        .font-dancing-script { font-family: 'Dancing Script', cursive; }
        .font-great-vibes { font-family: 'Great Vibes', cursive; }
        .font-allura { font-family: 'Allura', cursive; }
        .font-satisfy { font-family: 'Satisfy', cursive; }
        .font-kaushan-script { font-family: 'Kaushan Script', cursive; }
        .font-tangerine { font-family: 'Tangerine', cursive; }
        .font-sacramento { font-family: 'Sacramento', cursive; }
        .font-yellowtail { font-family: 'Yellowtail', cursive; }
        .font-pinyon-script { font-family: 'Pinyon Script', cursive; }
        .font-marck-script { font-family: 'Marck Script', cursive; }
        .font-amatic-sc { font-family: 'Amatic SC', cursive; }
        .font-permanent-marker { font-family: 'Permanent Marker', cursive; }
        .font-homemade-apple { font-family: 'Homemade Apple', cursive; }
        .font-rock-salt { font-family: 'Rock Salt', cursive; }
        
        .text-element {
          position: absolute;
          cursor: move;
          user-select: none;
          min-width: 50px;
          min-height: 30px;
          border: 2px solid transparent;
          transition: border-color 0.2s;
          padding: 8px;
        }
        
        .text-element.active {
          border-color: #8b5cf6;
        }
        
        .text-element.editing {
          cursor: text;
          user-select: text;
        }
      `}</style>

      {/* Panel de polices */}
      <div 
        className={`w-80 h-screen bg-gradient-to-b from-purple-700 to-indigo-900 text-white p-4 overflow-y-auto shadow-lg transition-transform duration-300 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Polices Artistiques</h1>
          <button 
            onClick={togglePanel}
            className="p-2 rounded-full hover:bg-purple-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Sélecteur de catégorie */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2 opacity-75">Catégories</h3>
          <div className="grid grid-cols-2 gap-2">
            {fontCategories.map((category, index) => (
              <button
                key={index}
                className={`p-2 text-xs rounded cursor-pointer transition-all duration-200 ${
                  currentCategory.name === category.name 
                    ? 'bg-purple-800 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => setCurrentCategory(category)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des polices de la catégorie sélectionnée */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentCategory.name}</h3>
          {currentCategory.fonts.map((font, index) => (
            <div
              key={index}
              className={`p-2 rounded cursor-pointer transition-all duration-200 hover:translate-x-2 hover:bg-white hover:bg-opacity-10 ${
                currentFont.name === font.name ? 'bg-purple-800' : ''
              } ${font.className}`}
              onClick={() => {
                setCurrentFont(font);
                if (activeElement) {
                  updateTextElement(activeElement, { fontFamily: font.className });
                }
              }}
            >
              <p className="text-xl">{font.name}</p>
              <p className="opacity-75">{currentCategory.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de travail blanche */}
      <div 
        ref={canvasRef}
        className={`flex-grow h-screen bg-white relative transition-all duration-300 ${
          isPanelOpen ? '' : '-ml-80'
        }`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        onClick={handleCanvasClick}
      >
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={() => addTextElement()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Ajouter du texte
          </button>
          <button 
            onClick={clearCanvas}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow transition"
          >
            Effacer tout
          </button>
        </div>
        
        {/* Bouton pour réouvrir le panel */}
        {!isPanelOpen && (
          <button 
            onClick={togglePanel}
            className="absolute top-4 left-4 bg-purple-600 text-white p-2 rounded-full shadow"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Contrôles de texte */}
        {activeElementData && (
          <div 
            className="absolute bg-white rounded-lg shadow-lg p-2 flex gap-2 z-50"
            style={{ 
              top: activeElementData.y - 60, 
              left: activeElementData.x 
            }}
          >
            <button 
              onClick={() => updateTextElement(activeElement!, { fontSize: activeElementData.fontSize + 2 })}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={() => updateTextElement(activeElement!, { fontSize: Math.max(8, activeElementData.fontSize - 2) })}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <input 
              type="color" 
              value={activeElementData.color}
              onChange={(e) => updateTextElement(activeElement!, { color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <button 
              onClick={() => deleteTextElement(activeElement!)}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Éléments de texte */}
        {textElements.map((element) => (
          <div
            key={element.id}
            className={`text-element ${element.fontFamily} ${activeElement === element.id ? 'active' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              fontSize: `${element.fontSize}px`,
              color: element.color
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateTextElement(element.id, { text: e.currentTarget.textContent || '' })}
          >
            {element.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage;

import React, { useState } from 'react';
import { ScratchCard } from '../ScratchCard';
import { RevealContent } from '../components/RevealContent';
import { BrandContentGenerator, BrandInfo } from '../generators/BrandContentGenerator';

const ModernScratchCardExample: React.FC = () => {
  const [result, setResult] = useState<'win' | 'lose'>('win');

  // Configuration de marque exemple
  const brandInfo: BrandInfo = {
    name: 'BeautyStore',
    industry: 'beauty',
    colors: {
      primary: '#E91E63',
      secondary: '#F48FB1',
      accent: '#FFD54F'
    },
    style: 'elegant',
    targetAudience: 'Femmes 25-45 ans'
  };

  const handleComplete = (percentage: number) => {
    console.log(`Carte grattée à ${percentage}%`);
    // Simulation du résultat
    const isWin = Math.random() > 0.5;
    setResult(isWin ? 'win' : 'lose');
  };

  const reset = () => {
    setResult('win');
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Nouvelle Carte à Gratter Moderne
      </h2>
      
      <div className="relative">
        <ScratchCard
          width={350}
          height={250}
          threshold={65}
          brushSize={25}
          showProgress={true}
          onComplete={handleComplete}
          brandConfig={{
            primaryColor: brandInfo.colors.primary,
            secondaryColor: brandInfo.colors.secondary,
            accentColor: brandInfo.colors.accent,
            backgroundColor: '#ffffff',
            textColor: '#333333',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '16px',
            shadow: '0 8px 32px rgba(233, 30, 99, 0.2)'
          }}
          revealContent={
            <RevealContent
              type={result}
              title={result === 'win' ? 'Félicitations !' : 'Presque !'}
              message={
                result === 'win' 
                  ? 'Vous avez gagné un soin visage gratuit !' 
                  : 'Tentez votre chance à nouveau demain !'
              }
              brandConfig={{
                primaryColor: brandInfo.colors.primary,
                secondaryColor: brandInfo.colors.secondary,
                accentColor: brandInfo.colors.accent,
                fontFamily: 'Inter, sans-serif'
              }}
            />
          }
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Réinitialiser
        </button>
        
        <button
          onClick={() => setResult(result === 'win' ? 'lose' : 'win')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Changer Résultat
        </button>
      </div>

      <div className="text-center text-sm text-gray-600 max-w-md">
        <p>
          Cette nouvelle carte à gratter utilise une architecture moderne et modulaire.
          Elle supporte la personnalisation par marque, les animations fluides, 
          et l'intégration avec l'IA pour générer du contenu adapté.
        </p>
      </div>
    </div>
  );
};

export default ModernScratchCardExample;

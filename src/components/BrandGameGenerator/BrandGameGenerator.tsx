
import React, { useState } from 'react';
import { Globe, Sparkles, Eye, ArrowRight, Loader2, Image } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { GeneratedGameConcept } from '../../services/openAIGameGeneratorService';

interface BrandGameGeneratorProps {
  onGameGenerated: (concept: GeneratedGameConcept) => void;
  onCancel?: () => void;
}

type GenerationStep = 'input' | 'generating' | 'preview' | 'complete';

const BrandGameGenerator: React.FC<BrandGameGeneratorProps> = ({
  onGameGenerated,
  onCancel
}) => {
  const [step, setStep] = useState<GenerationStep>('input');
  const [url, setUrl] = useState('');
  const [gameConcept, setGameConcept] = useState<GeneratedGameConcept | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!url) {
      setError('Veuillez saisir une URL');
      return;
    }

    try {
      setError(null);
      setStep('generating');

      console.log('Calling brand-game-generator function with URL:', url);
      
      const { data, error: functionError } = await supabase.functions.invoke('brand-game-generator', {
        body: { url }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      console.log('Generated game concept:', data);
      setGameConcept(data);
      setStep('preview');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
      setStep('input');
    }
  };

  const handleApply = () => {
    if (gameConcept) {
      onGameGenerated(gameConcept);
      setStep('complete');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#841b60] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Générer une Campagne de Marque
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Saisissez l'URL du site web d'une marque pour générer automatiquement un jeu marketing entièrement personnalisé avec logo et couleurs extraits
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du site web de la marque
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemple.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!url}
                  className="flex-1 px-6 py-3 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Générer la Campagne
                </button>
              </div>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-[#841b60] animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Génération en cours...</h3>
            <p className="text-gray-600">Extraction du logo, analyse du site web et création du concept de jeu...</p>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Campagne Générée !</h3>
              <p className="text-gray-600">Votre campagne de marque est prête avec logo et couleurs automatiquement extraits</p>
            </div>

            {gameConcept && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-lg border-2 relative"
                    style={{ 
                      backgroundColor: gameConcept.colors.background,
                      borderColor: gameConcept.colors.primary 
                    }}
                  >
                    {/* Logo display */}
                    {gameConcept.logo && (
                      <div className="absolute top-4 right-4">
                        <img 
                          src={gameConcept.logo} 
                          alt="Logo de la marque" 
                          className="w-12 h-12 object-contain rounded-md border border-gray-200 bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      {gameConcept.logo && (
                        <img 
                          src={gameConcept.logo} 
                          alt="Logo de la marque" 
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2" style={{ color: gameConcept.colors.primary }}>
                          {gameConcept.gameName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Type: {gameConcept.gameType} • Thème: {gameConcept.theme}
                        </p>
                        <p className="text-sm" style={{ color: gameConcept.colors.secondary }}>
                          {gameConcept.content.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Titre:</h5>
                      <p className="text-gray-600">{gameConcept.content.title}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Bouton:</h5>
                      <p className="text-gray-600">{gameConcept.content.buttonText}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Prix:</h5>
                    <div className="flex flex-wrap gap-2">
                      {gameConcept.gameConfig.prizes.slice(0, 3).map((prize, index) => (
                        <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm">
                          {prize}
                        </span>
                      ))}
                    </div>
                  </div>

                  {gameConcept.logo && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Logo automatiquement extrait et intégré</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Générer à Nouveau
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Appliquer dans l'Éditeur
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Campagne Appliquée !</h3>
            <p className="text-gray-600">Votre campagne de marque avec logo automatique est maintenant prête pour l'édition et la prévisualisation</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default BrandGameGenerator;

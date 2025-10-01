
import React, { useState } from 'react';
import { Globe, Sparkles, Eye, ArrowRight, Loader2, Image, Palette, Zap } from 'lucide-react';
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

      console.log('Generating studio-level campaign for URL:', url);
      
      const { data, error: functionError } = await supabase.functions.invoke('brand-game-generator', {
        body: { url }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      console.log('Studio-level campaign generated:', data);
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
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#841b60] via-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Sparkles className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#841b60] via-purple-600 to-indigo-600 rounded-full animate-pulse opacity-50"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Générateur de Campagnes Studio
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Créez automatiquement des campagnes marketing de niveau professionnel en analysant 
                n'importe quel site web. Notre IA génère des designs premium avec logo, couleurs et 
                contenu parfaitement adaptés à l'identité de marque.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Niveau Studio - Fonctionnalités Premium
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <Palette className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Extraction automatique des couleurs de marque</span>
                </div>
                <div className="flex items-start gap-3">
                  <Image className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Intégration native du logo en haute qualité</span>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Copy marketing professionnel généré par IA</span>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Optimisation mobile et desktop avancée</span>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Effets premium et micro-interactions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Analyse comportementale de l'audience</span>
                </div>
              </div>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Exemples : nike.com, coca-cola.com, apple.com, etc.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                    {error}
                  </p>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#841b60] via-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Générer Campagne Studio
                </button>
              </div>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-[#841b60] animate-spin mx-auto" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full mx-auto"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Création en cours...
            </h3>
            <div className="space-y-3 text-gray-600 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-gradient-to-br from-[#841b60] to-[#b41b60] rounded-full"></div>
                <span>Analyse du site web et extraction du logo</span>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse" style={{animationDelay: '0.5s'}}>
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>Génération du concept créatif premium</span>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse" style={{animationDelay: '1s'}}>
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                <span>Optimisation de l'expérience utilisateur</span>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Campagne Studio Générée !
              </h3>
              <p className="text-gray-600">
                Votre campagne premium est prête avec une qualité digne des meilleures agences
              </p>
            </div>

            {gameConcept && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border">
                <div className="space-y-6">
                  {/* Premium Campaign Preview */}
                  <div 
                    className="p-6 rounded-xl border-2 relative overflow-hidden"
                    style={{ 
                      backgroundColor: gameConcept.colors.background,
                      borderColor: gameConcept.colors.primary,
                      backgroundImage: gameConcept.design.premiumEffects?.gradient ? 
                        `linear-gradient(135deg, ${gameConcept.colors.primary}15, ${gameConcept.colors.secondary}15)` : 
                        'none'
                    }}
                  >
                    {/* Logo showcase */}
                    {gameConcept.logo && (
                      <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                        <img 
                          src={gameConcept.logo} 
                          alt="Logo de la marque" 
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {gameConcept.logo && (
                        <div className="flex-shrink-0">
                          <img 
                            src={gameConcept.logo} 
                            alt="Logo de la marque" 
                            className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 
                            className="font-bold text-xl"
                            style={{ color: gameConcept.colors.primary }}
                          >
                            {gameConcept.gameName}
                          </h4>
                          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            STUDIO
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Type:</span> {gameConcept.gameType} • 
                          <span className="font-medium"> Thème:</span> {gameConcept.theme} • 
                          <span className="font-medium"> Niveau:</span> Premium
                        </p>
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: gameConcept.colors.secondary }}
                        >
                          {gameConcept.content.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Studio Features */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-500" />
                        Design Premium
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        <p>✓ Effets visuels avancés</p>
                        <p>✓ Micro-interactions</p>
                        <p>✓ Animations fluides</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        Expérience Utilisateur
                      </h5>
                      <div className="space-y-1 text-gray-600">
                        <p>✓ Optimisation mobile</p>
                        <p>✓ Interface intuitive</p>
                        <p>✓ Performance optimisée</p>
                      </div>
                    </div>
                  </div>

                  {/* Prizes Preview */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      Prix Premium Suggérés:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {gameConcept.gameConfig.prizes.slice(0, 4).map((prize, index) => (
                        <span 
                          key={index} 
                          className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                        >
                          {prize}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Logo Integration Success */}
                  {gameConcept.logo && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">Logo Intégré avec Succès</p>
                          <p className="text-sm text-green-700">
                            Logo automatiquement extrait et optimisé pour tous les formats
                          </p>
                        </div>
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
                Générer une Autre
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#841b60] via-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
              >
                <ArrowRight className="w-5 h-5" />
                Appliquer dans l'Éditeur
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Campagne Studio Appliquée !
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Votre campagne de niveau professionnel avec logo automatique et design premium 
              est maintenant prête pour l'édition et la prévisualisation
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BrandGameGenerator;

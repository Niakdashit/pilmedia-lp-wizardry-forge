
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';

interface TextSuggestionsProps {
  extractedColors: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  onAddText: (text: string) => void;
}

const TextSuggestions: React.FC<TextSuggestionsProps> = ({
  extractedColors,
  onAddText
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Suggestions par défaut basées sur les couleurs
  const getDefaultSuggestions = () => {
    const colorBasedSuggestions = [
      "Découvrez votre chance",
      "Gagnez maintenant !",
      "Offre exclusive",
      "Tentez votre chance",
      "Prix incroyables à gagner"
    ];

    if (extractedColors) {
      // Suggestions adaptées aux couleurs (exemple simplifié)
      const isDark = isColorDark(extractedColors.primary);
      if (isDark) {
        return [
          "Élégance et sophistication",
          "Expérience premium",
          "Luxe à portée de main",
          ...colorBasedSuggestions.slice(0, 2)
        ];
      } else {
        return [
          "Énergie et dynamisme",
          "Vivez l'aventure",
          "Couleurs de la victoire",
          ...colorBasedSuggestions.slice(0, 2)
        ];
      }
    }

    return colorBasedSuggestions;
  };

  const isColorDark = (color: string): boolean => {
    // Conversion hex vers RGB et calcul de luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // TODO: Intégrer avec ChatGPT pour des suggestions plus intelligentes
  const generateAISuggestions = async () => {
    setIsGenerating(true);
    try {
      // Ici on pourrait intégrer l'API ChatGPT pour analyser le logo et générer des suggestions contextuelle
      // Pour l'instant, on simule avec un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiSuggestions = [
        "Votre marque, votre succès",
        "Innovation et excellence",
        "Rejoignez l'aventure",
        "Créez votre légende",
        "L'excellence vous attend"
      ];
      
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Erreur génération suggestions:', error);
      setSuggestions(getDefaultSuggestions());
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setSuggestions(getDefaultSuggestions());
  }, [extractedColors]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Suggestions de texte</h3>
        </div>
        
        <button
          onClick={generateAISuggestions}
          disabled={isGenerating}
          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
          title="Générer avec IA"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={`${suggestion}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <button
              onClick={() => onAddText(suggestion)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl transition-all group-hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 group-hover:text-purple-700 font-medium">
                  {suggestion}
                </span>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {isGenerating && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="flex items-center space-x-2 text-purple-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Génération IA en cours...</span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce :</strong> Cliquez sur une suggestion pour l'ajouter à votre aperçu. 
          Vous pourrez ensuite la déplacer et la personnaliser.
        </p>
      </div>
    </div>
  );
};

export default TextSuggestions;

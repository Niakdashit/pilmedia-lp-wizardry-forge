
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2 } from 'lucide-react';

interface AIAssistantSidebarProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({
  isGenerating,
  onGenerate
}) => {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-[#841b60]" />
        <h3 className="text-lg font-semibold text-gray-900">Assistant IA</h3>
      </div>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Décrivez votre campagne idéale..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[#841b60] resize-none"
        />
        
        <button
          onClick={onGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              <span>Génération...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Générer avec l'IA</span>
            </>
          )}
        </button>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Suggestions rapides</h4>
        <div className="space-y-2">
          {[
            "Roue de la fortune pour nouveaux clients",
            "Quiz interactif sur les produits",
            "Jeu de grattage avec récompenses"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setPrompt(suggestion)}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-[#841b60]/5 rounded-lg text-sm text-gray-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantSidebar;

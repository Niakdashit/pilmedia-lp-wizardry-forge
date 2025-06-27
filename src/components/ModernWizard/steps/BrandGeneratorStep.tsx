
import React, { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import BrandGameGenerator from '../../BrandGameGenerator/BrandGameGenerator';
import { GeneratedGameConcept } from '../../../services/openAIGameGeneratorService';
import { transformBrandGameToCampaign } from '../../../utils/brandGameTransformer';

interface BrandGeneratorStepProps {
  onNext: (campaignData: any) => void;
  onPrev: () => void;
  onSkip: () => void;
}

const BrandGeneratorStep: React.FC<BrandGeneratorStepProps> = ({
  onNext,
  onPrev,
  onSkip
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const handleGameGenerated = (concept: GeneratedGameConcept) => {
    const campaignData = transformBrandGameToCampaign(concept);
    setIsGenerating(false);
    onNext(campaignData);
  };

  if (showGenerator) {
    return (
      <BrandGameGenerator
        onGameGenerated={handleGameGenerated}
        onCancel={() => setShowGenerator(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#841b60] to-[#6d164f] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Generate Brand Campaign
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Automatically create a fully branded marketing game by simply entering a website URL. 
            Our AI will extract brand colors, logos, and content to generate the perfect campaign.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">✨ What you'll get:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Brand colors automatically extracted</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Logo and visual assets integrated</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Game type optimized for your brand</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Copy and tone matching brand voice</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowGenerator(true)}
            disabled={isGenerating}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-[#841b60] to-[#6d164f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate from Brand URL
          </button>
          
          <button
            onClick={onSkip}
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Skip & Create Manually
          </button>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onPrev}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandGeneratorStep;

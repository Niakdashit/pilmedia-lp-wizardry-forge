
import React, { useState } from 'react';
import { Globe, Sparkles, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { ScrapingBeeService, BrandData } from '../../services/scrapingBeeService';
import { OpenAIGameGeneratorService, GeneratedGameConcept } from '../../services/openAIGameGeneratorService';
import BrandPreview from './BrandPreview';
import GeneratedGamePreview from './GeneratedGamePreview';

interface BrandGameGeneratorProps {
  onGameGenerated: (concept: GeneratedGameConcept) => void;
  onCancel?: () => void;
}

type GenerationStep = 'input' | 'extracting' | 'generating' | 'preview' | 'complete';

const BrandGameGenerator: React.FC<BrandGameGeneratorProps> = ({
  onGameGenerated,
  onCancel
}) => {
  const [step, setStep] = useState<GenerationStep>('input');
  const [url, setUrl] = useState('');
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [gameConcept, setGameConcept] = useState<GeneratedGameConcept | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState({
    scrapingBee: '',
    openAI: ''
  });

  const handleGenerate = async () => {
    if (!url || !apiKeys.scrapingBee || !apiKeys.openAI) {
      setError('Please provide URL and API keys');
      return;
    }

    try {
      setError(null);
      setStep('extracting');

      // Step 1: Extract brand data
      const scrapingBee = new ScrapingBeeService(apiKeys.scrapingBee);
      const extractedBrandData = await scrapingBee.extractBrandData(url);
      setBrandData(extractedBrandData);

      setStep('generating');

      // Step 2: Generate game concept
      const openAI = new OpenAIGameGeneratorService(apiKeys.openAI);
      const generatedConcept = await openAI.generateGameConcept(extractedBrandData);
      setGameConcept(generatedConcept);

      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
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
                Generate Brand Campaign
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter a brand's website URL to automatically generate a fully branded marketing game
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ScrapingBee API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.scrapingBee}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, scrapingBee: e.target.value }))}
                    placeholder="Enter ScrapingBee API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys.openAI}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, openAI: e.target.value }))}
                    placeholder="Enter OpenAI API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
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
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!url || !apiKeys.scrapingBee || !apiKeys.openAI}
                  className="flex-1 px-6 py-3 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Campaign
                </button>
              </div>
            </div>
          </div>
        );

      case 'extracting':
        return (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-[#841b60] animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Extracting Brand Data</h3>
            <p className="text-gray-600">Analyzing website content, colors, and design...</p>
          </div>
        );

      case 'generating':
        return (
          <div className="space-y-8">
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[#841b60] animate-pulse mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Game Concept</h3>
              <p className="text-gray-600">Creating the perfect marketing game for this brand...</p>
            </div>
            
            {brandData && <BrandPreview brandData={brandData} />}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Generated!</h3>
              <p className="text-gray-600">Review your branded campaign and apply it to start editing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {brandData && <BrandPreview brandData={brandData} />}
              {gameConcept && <GeneratedGamePreview gameConcept={gameConcept} />}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Generate Again
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3 bg-[#841b60] text-white rounded-lg hover:bg-[#6d164f] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Apply to Editor
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Applied!</h3>
            <p className="text-gray-600">Your branded campaign is now ready for editing and preview</p>
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

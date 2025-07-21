
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Tablet, Smartphone, Download, Share, Sparkles } from 'lucide-react';
import DevicePreview from './DevicePreview';
import TextSuggestions from './TextSuggestions';

interface BrandedPreviewStepProps {
  logoUrl: string;
  backgroundUrl?: string;
  extractedColors: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  extractedFont?: string;
  isExtracting: boolean;
  onBack: () => void;
  onComplete?: (campaignData: any) => void;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const BrandedPreviewStep: React.FC<BrandedPreviewStepProps> = ({
  logoUrl,
  backgroundUrl,
  extractedColors,
  extractedFont,
  isExtracting,
  onBack,
  onComplete
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [customTexts, setCustomTexts] = useState<Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    style: any;
  }>>([]);

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablette' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
  ];

  const handleAddText = (suggestion: string) => {
    const newText = {
      id: Date.now().toString(),
      text: suggestion,
      position: { x: 50, y: 30 },
      style: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: extractedColors?.primary || '#000000',
        fontFamily: extractedFont || 'Inter, sans-serif'
      }
    };
    setCustomTexts(prev => [...prev, newText]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Aperçu Premium</h1>
                  <p className="text-sm text-gray-600">Votre campagne brandée automatiquement</p>
                </div>
              </div>
              
              {isExtracting && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-blue-700">Extraction en cours...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Device Selector */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                {devices.map((device) => {
                  const Icon = device.icon;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        selectedDevice === device.id
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{device.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Text Suggestions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <TextSuggestions
              logoUrl={logoUrl}
              extractedColors={extractedColors}
              onAddText={handleAddText}
            />
          </motion.div>

          {/* Main Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Aperçu {devices.find(d => d.id === selectedDevice)?.label}
                  </h2>
                  
                  {extractedColors && (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Couleurs extraites :</span>
                      <div className="flex space-x-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: extractedColors.primary }}
                          title="Couleur primaire"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: extractedColors.secondary }}
                          title="Couleur secondaire"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: extractedColors.accent }}
                          title="Couleur d'accent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DevicePreview
                  device={selectedDevice}
                  logoUrl={logoUrl}
                  backgroundUrl={backgroundUrl}
                  extractedColors={extractedColors}
                  extractedFont={extractedFont}
                  customTexts={customTexts}
                  onUpdateTexts={setCustomTexts}
                />
              </div>
            </div>

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Votre campagne est prête !</h3>
                  <p className="text-sm text-gray-600">
                    Personnalisez davantage ou exportez votre création
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Modifier en détail
                  </button>
                  <button
                    onClick={() => onComplete?.({
                      logoUrl,
                      backgroundUrl,
                      extractedColors,
                      extractedFont,
                      customTexts
                    })}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Finaliser la campagne
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BrandedPreviewStep;

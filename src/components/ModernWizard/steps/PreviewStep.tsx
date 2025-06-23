
import React from 'react';
import { Eye, Monitor, Smartphone, Tablet, AlertCircle } from 'lucide-react';
import type { WizardData } from '../ModernWizard';
import QuizPreview from '../../GameTypes/QuizPreview';
import PhoneFrame from './components/PhoneFrame';

interface PreviewStepProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  wizardData,
  nextStep,
  prevStep
}) => {
  const [selectedDevice, setSelectedDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Vérification de la disponibilité des données
  const hasQuizData = wizardData.generatedQuiz && wizardData.generatedQuiz.questions?.length > 0;
  
  console.log('📋 PreviewStep - Données du wizard:', {
    hasGeneratedQuiz: !!wizardData.generatedQuiz,
    questionsCount: wizardData.generatedQuiz?.questions?.length || 0,
    allData: wizardData
  });

  // Ajout récupération design et logo extraits automatiquement si présents
  const brandTheme = wizardData.extractedBrandTheme;
  const quizDesign =
    brandTheme?.customColors
      ? {
          containerBackgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderRadius: '16px',
          customColors: brandTheme.customColors // pour compat potentiel CustomQuizGame ou usage futur
        }
      : {
          containerBackgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderRadius: '16px',
        };

  const logoOrExtracted = brandTheme?.logoUrl || wizardData.logo;

  // Construction sécurisée de la configuration du quiz
  const buildQuizConfig = () => {
    if (!hasQuizData) {
      console.log('⚠️ Aucune donnée de quiz disponible');
      return { questions: [] };
    }
    
    const qs = wizardData.generatedQuiz.questions || [];
    const config = {
      questions: qs.map((q: any, qi: number) => ({
        id: qi,
        text: q.question,
        options: q.choices.map((c: string, ci: number) => ({
          id: ci,
          text: c,
          isCorrect: c === q.answer
        })),
        feedback: { 
          correct: wizardData.generatedQuiz.successText ?? 'Bonne réponse !',
          incorrect: wizardData.generatedQuiz.errorText ?? 'Mauvaise réponse, essayez encore !'
        }
      }))
    };
    
    console.log('🎯 Configuration quiz construite:', config);
    return config;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Aperçu de votre campagne
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Découvrez le rendu final de votre campagne sur différents appareils avant de la publier.
          </p>
        </div>

        {/* Device Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-[#141e29] mb-4">Sélectionnez un appareil</h3>
          <div className="flex space-x-2">
            {[
              { id: 'desktop', label: 'Desktop', icon: Monitor },
              { id: 'tablet', label: 'Tablet', icon: Tablet },
              { id: 'mobile', label: 'Mobile', icon: Smartphone }
            ].map(device => {
              const Icon = device.icon;
              return (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedDevice === device.id
                      ? 'bg-[#951b6d] text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                  type="button"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{device.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#951b6d]" />
            </div>
            <h3 className="font-semibold text-[#141e29]">Aperçu {selectedDevice}</h3>
          </div>
          
          <div className="p-0 flex justify-center">
            {hasQuizData ? (
              selectedDevice === 'mobile' ? (
                <PhoneFrame logoUrl={logoOrExtracted}>
                  <QuizPreview 
                    config={buildQuizConfig()} 
                    design={quizDesign}
                  />
                </PhoneFrame>
              ) : (
                <div className="w-full flex justify-center items-center py-8 px-6">
                  <QuizPreview 
                    config={buildQuizConfig()} 
                    design={quizDesign}
                  />
                </div>
              )
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Données indisponibles</h4>
                  <p className="text-gray-600 mb-4">
                    Impossible de charger l'aperçu du quiz. Retournez à l'étape précédente pour regénérer.
                  </p>
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 bg-[#951b6d] text-white rounded-lg hover:bg-[#7d1659] transition-colors"
                  >
                    Retour à la génération
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            type="button"
          >
            Retour
          </button>
          <button
            onClick={nextStep}
            disabled={!hasQuizData}
            className={`px-8 py-3 font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md ${
              hasQuizData
                ? 'bg-[#951b6d] text-white hover:bg-[#7d1659]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            type="button"
          >
            Publier la campagne
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;

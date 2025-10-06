import { useState } from 'react';
import { WizardData } from '../../ModernWizard';
import { supabase } from '@/integrations/supabase/client';

interface UseQuizGenerationProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
}

export const useQuizGeneration = ({ wizardData, updateWizardData, nextStep }: UseQuizGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastRawApiResponse, setLastRawApiResponse] = useState<string>('');

  const getMockQuizData = () => ({
    intro: "Testez vos connaissances sur notre produit !",
    cta: "Commencer le quiz",
    questions: [
      {
        question: "Quelle est la principale caractéristique de notre produit ?",
        choices: ["Innovation", "Qualité", "Prix", "Design"],
        answer: "Innovation"
      },
      {
        question: "Dans quel domaine excellons-nous le plus ?",
        choices: ["Service client", "Technologie", "Marketing", "Logistique"],
        answer: "Service client"
      },
      {
        question: "Que recherchent nos clients avant tout ?",
        choices: ["Rapidité", "Fiabilité", "Économies", "Simplicité"],
        answer: "Fiabilité"
      }
    ],
    errorText: "Oops ! Mauvaise réponse. Essayez encore !",
    successText: "Bravo ! Vous connaissez bien notre produit !"
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);
    setDebugInfo('Initialisation...');

    try {
      setDebugInfo('Appel à l\'API Supabase via client');
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 80));
      }, 500);

      const payload = {
        logoUrl: wizardData.logo,
        desktopVisualUrl: wizardData.desktopVisual,
        mobileVisualUrl: wizardData.mobileVisual,
        websiteUrl: wizardData.websiteUrl,
        productName: wizardData.productName,
        manualContent: wizardData['manualContent'] || ''
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log('[QuizGen] Payload envoyé à l\'API:', payload);
      }

      // Use Supabase client to invoke edge function
      const { data, error: invokeError } = await supabase.functions.invoke('quiz', {
        body: payload,
      });

      clearInterval(progressInterval);

      if (invokeError) {
        console.error('[QuizGen] Erreur API:', invokeError);
        setDebugInfo(invokeError.message);
        setError(`Erreur API : ${invokeError.message}`);
        updateWizardData({ generatedQuiz: getMockQuizData() });
        setProgress(100);
        setIsGenerating(false);
        setTimeout(() => nextStep(), 2000);
        return;
      }

      // Tout bon !
      if (process.env.NODE_ENV !== 'production') {
        console.log('[QuizGen] Réponse JSON reçue :', data);
      }
      setProgress(100);
      setDebugInfo('Réponse API OK. Quiz personnalisé reçu.');
      setLastRawApiResponse(JSON.stringify(data));
      updateWizardData({ generatedQuiz: data });

    } catch (error: any) {
      console.error('[QuizGen] Erreur génération:', error);
      setDebugInfo(error?.message || String(error));
      setError('Erreur lors de la génération du quiz - fallback mock');
      updateWizardData({ generatedQuiz: getMockQuizData() });
      setProgress(100);

    } finally {
      setIsGenerating(false);
      setTimeout(() => nextStep(), 2000);
    }
  };

  return {
    isGenerating,
    error,
    progress,
    debugInfo,
    handleGenerate,
    lastRawApiResponse
  };
};

import { useState } from 'react';
import { WizardData } from '../../ModernWizard';

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
  const [lastRawApiResponse, setLastRawApiResponse] = useState<string>(''); // Pour debug

  const quizEndpoint = 'https://cknwowuaqymprfaylwti.supabase.co/functions/v1/quiz';
  const supabaseApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrbndvd3VhcXltcHJmYXlsd3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTYyNzUsImV4cCI6MjA2NTU3MjI3NX0.dPKnFeUMeufXNyO531OPXhT-s0DeJVyJIV2fhbRcL3Q'; // clef publique ! Pas à sécuriser

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
      setDebugInfo('Appel à l\'API Supabase (header apikey envoyé)');
      console.log('🚀 [QuizGen] Appel API avec endpoint:', quizEndpoint);

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

      console.log('[QuizGen] Payload envoyé à l\'API:', payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 12000);

      // Ajout du header apikey !
      const response = await fetch(quizEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lovable-Quiz-Generator/1.0',
          'Origin': window.location.origin,
          'apikey': supabaseApiKey // Ajout !
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: 'cors'
      });

      clearInterval(progressInterval);
      clearTimeout(timeoutId);

      console.log('[QuizGen] Réponse HTTP:', response);

      let data;
      let textBody = '';
      try {
        textBody = await response.text();
        setLastRawApiResponse(textBody);
        try {
          data = JSON.parse(textBody);
        } catch (jsonErr) {
          console.error('[QuizGen] Échec parsing JSON:', jsonErr, textBody);
          throw new Error("Échec parsing JSON de la réponse API.");
        }
      } catch (err) {
        console.error('[QuizGen] Impossible de lire la réponse HTTP:', err);
        throw new Error("Erreur réseau/réponse introuvable");
      }

      if (!response.ok || data?.error) {
        console.error('[QuizGen] Erreur API:', data?.error || textBody);
        setDebugInfo(data?.error ? String(data.error) : textBody);
        setError(`Erreur API : ${data?.error || "appel échoué"}`);
        updateWizardData({ generatedQuiz: getMockQuizData() });
        setProgress(100);
        setIsGenerating(false);
        setTimeout(() => nextStep(), 2000);
        return;
      }

      // Tout bon !
      console.log('[QuizGen] Réponse JSON reçue :', data);
      setProgress(100);
      setDebugInfo('Réponse API OK. Quiz personnalisé reçu.');
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
    quizEndpoint,
    handleGenerate,
    lastRawApiResponse
  };
};

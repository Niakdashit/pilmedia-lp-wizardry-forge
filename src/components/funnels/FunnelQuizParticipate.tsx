import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import FormHandler from './components/FormHandler';
import { useParticipations } from '../../hooks/useParticipations';
import { FieldConfig } from '../forms/DynamicContactForm';
import QuizGame from '../GameTypes/QuizGame';
import type { QuizCompletionSummary } from '../GameTypes/Quiz/QuizContainer';

interface FunnelQuizParticipateProps {
  campaign: any;
  previewMode: 'mobile' | 'tablet' | 'desktop';
}

// Flow: Participate button -> Quiz -> Form -> Thank you (+optional score) -> Replay
const FunnelQuizParticipate: React.FC<FunnelQuizParticipateProps> = ({ campaign, previewMode }) => {
  const [phase, setPhase] = useState<'participate' | 'quiz' | 'form' | 'thankyou'>('participate');
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [quizResponses, setQuizResponses] = useState<QuizCompletionSummary['responses']>([]);

  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [participationLoading, setParticipationLoading] = useState<boolean>(false);

  const showScore = !!campaign?.gameConfig?.quiz?.showScore;
  const quizConfig = campaign?.gameConfig?.quiz;

  const { createParticipation } = useParticipations();

  const fields: FieldConfig[] = useMemo(() => (
    (campaign?.formFields && Array.isArray(campaign.formFields)) ? campaign.formFields : [
      { id: 'prenom', label: 'Prénom', type: 'text', required: true },
      { id: 'nom', label: 'Nom', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  ), [campaign?.formFields]);

  const backgroundStyle: React.CSSProperties = useMemo(() => ({
    background: campaign.design?.background?.type === 'image'
      ? `url(${campaign.design.background.value}) center/cover no-repeat`
      : campaign.design?.background?.value || '#ffffff'
  }), [campaign?.design?.background]);

  const handleParticipate = () => {
    if (quizConfig?.questions?.length) {
      setPhase('quiz');
    } else {
      setPhase('form');
    }
  };

  useEffect(() => {
    setShowFormModal(phase === 'form');
  }, [phase]);

  const handleQuizComplete = useCallback((result: QuizCompletionSummary) => {
    setScore(result.score);
    setTotalQuestions(result.total);
    setQuizResponses(result.responses);
    setPhase('form');
  }, []);

  const handleFormClose = useCallback(() => {
    setShowFormModal(false);
    setPhase('participate');
  }, []);

  const handleFormSubmit = async (formData: Record<string, string>) => {
    setParticipationLoading(true);
    try {
      if (campaign.id) {
        await createParticipation({
          campaign_id: campaign.id,
          form_data: { ...formData, score, totalQuestions, quizResponses },
          user_email: formData.email
        });
      }
      setShowFormModal(false);
      setPhase('thankyou');
    } catch (e) {
      console.error('[FunnelQuizParticipate] submit error', e);
      toast.error('Erreur lors de la soumission du formulaire');
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleReplay = () => {
    setScore(0);
    setTotalQuestions(0);
    setQuizResponses([]);
    setPhase('participate');
  };

  return (
    <div className="w-full h-[100dvh] min-h-[100dvh]">
      <div className="relative w-full h-full">
        <div className="absolute inset-0" style={backgroundStyle} />

        {/* Participate phase */}
        {phase === 'participate' && (
          <div className="relative z-10 h-full flex items-center justify-center">
            <button
              onClick={handleParticipate}
              className="px-6 py-3 text-white rounded-lg shadow-md bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95 transition"
            >
              Participer
            </button>
          </div>
        )}

        {phase === 'quiz' && (
          <div className="relative z-10 h-full flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl">
              <QuizGame
                config={quizConfig}
                design={campaign.design}
                onGameComplete={handleQuizComplete}
                showResultsScreen={false}
              />
            </div>
          </div>
        )}

        {/* Form phase - use modal component to keep look consistent */}
        <FormHandler
          showFormModal={showFormModal}
          campaign={campaign}
          fields={fields}
          participationLoading={participationLoading}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />

        {/* Thank you phase */}
        {phase === 'thankyou' && (
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur px-6 py-5 rounded-xl shadow">
              <div className="text-lg font-semibold text-gray-800 mb-2">Merci pour votre participation !</div>
              {showScore && (
                <div className="text-sm text-gray-700 mb-3">
                  Score: {score}{totalQuestions ? `/${totalQuestions}` : ''}
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={handleReplay}
                  className="px-4 py-2 text-white rounded-lg bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] hover:opacity-95"
                >
                  Rejouer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelQuizParticipate;

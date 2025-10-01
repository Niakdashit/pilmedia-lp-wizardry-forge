
export const createSynchronizedQuizCampaign = (campaign: any) => {
  // Si ce n'est pas un quiz, retourner la campagne telle quelle
  if (campaign.type !== 'quiz') {
    return campaign;
  }

  // Synchroniser la configuration du quiz avec les autres paramètres
  const quizConfig = campaign.gameConfig?.quiz || {};
  const questions = quizConfig.questions || [];

  return {
    ...campaign,
    gameConfig: {
      ...campaign.gameConfig,
      quiz: {
        ...quizConfig,
        questions: questions.map((q: any) => ({
          ...q,
          // Assurer que chaque question a au moins 2 options
          options: q.options && q.options.length >= 2 ? q.options : [
            { text: 'Option 1', isCorrect: true },
            { text: 'Option 2', isCorrect: false }
          ]
        }))
      }
    }
  };
};

export const createEnhancedQuizDesign = (config: { design?: any }) => {
  const design = config.design || {};
  
  return {
    backgroundColor: design.background || '#f8fafc',
    primaryColor: design.primaryColor || '#d4dbe8',
    secondaryColor: design.secondaryColor || '#ffffff',
    textColor: design.titleColor || '#000000',
    buttonColor: design.buttonColor || '#d4dbe8',
    buttonTextColor: design.buttonTextColor || '#ffffff',
    borderRadius: design.borderRadius || '0.5rem',
    fontFamily: design.fontFamily || 'Inter',
    ...design
  };
};

export const validateQuizConfiguration = (campaign: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (campaign.type !== 'quiz') {
    return { isValid: true, errors: [] };
  }

  const questions = campaign.gameConfig?.quiz?.questions || [];
  
  if (questions.length === 0) {
    errors.push('Le quiz doit contenir au moins une question');
  }

  questions.forEach((question: any, index: number) => {
    if (!question.text || question.text.trim() === '') {
      errors.push(`La question ${index + 1} doit avoir un texte`);
    }
    
    if (!question.options || question.options.length < 2) {
      errors.push(`La question ${index + 1} doit avoir au moins 2 options`);
    }
    
    const correctAnswers = question.options?.filter((option: any) => option.isCorrect) || [];
    if (correctAnswers.length === 0) {
      errors.push(`La question ${index + 1} doit avoir au moins une réponse correcte`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

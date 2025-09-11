// Quiz configuration constants
export const DEFAULT_QUIZ_CONFIG = {
  title: 'Mon Quiz',
  type: 'quiz' as const,
  allowSkip: false,
  showScore: true,
  randomizeQuestions: false,
  timeLimit: 0,
  questions: []
};

export const QUIZ_TYPES = [
  { value: 'quiz', label: 'quiz.types.quiz' },
  { value: 'survey', label: 'quiz.types.survey' },
  { value: 'poll', label: 'quiz.types.poll' }
];

export const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'quiz.questionTypes.multipleChoice' },
  { value: 'true-false', label: 'quiz.questionTypes.trueFalse' },
  { value: 'short-answer', label: 'quiz.questionTypes.shortAnswer' },
  { value: 'long-answer', label: 'quiz.questionTypes.longAnswer' },
  { value: 'rating', label: 'quiz.questionTypes.rating' },
  { value: 'scale', label: 'quiz.questionTypes.scale' }
];

// Item types for drag and drop
export const ITEM_TYPES = {
  QUESTION: 'question',
  ANSWER: 'answer',
  ELEMENT: 'element'
} as const;

export type ItemType = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];
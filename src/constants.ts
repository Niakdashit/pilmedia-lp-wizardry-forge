// @ts-nocheck
// Centralized constants used by QuizEditor and ModelEditor

// Drag and drop item types
export const ItemTypes = {
  CARD: 'card',
  QUESTION: 'question',
  OPTION: 'option'
};

// Default overall quiz configuration
export const DEFAULT_QUIZ_CONFIG = {
  title: '',
  description: '',
  successMessage: '',
  failureMessage: '',
  // Editor/runtime helpers
  type: 'standard', // 'standard' | 'survey'
  allowSkip: false,
  // For ModelEditor usage; QuizEditor often manages questions separately
  questions: [],
};

// Default per-question configuration (used by QuizEditor simple panel)
export const DEFAULT_QUESTION_CONFIG = {
  prompt: '',
  correctAnswer: '',
  incorrectAnswer1: '',
  incorrectAnswer2: '',
  incorrectAnswer3: '',
};

// Available quiz types (used by ModelEditor panel)
export const QUIZ_TYPES = [
  { value: 'standard', label: 'quiz.types.standard' },
  { value: 'survey', label: 'quiz.types.survey' },
];

// Available question types (used by ModelEditor panel)
export const QUESTION_TYPES = [
  { value: 'text', label: 'quiz.question.types.text' },
  { value: 'multiple_choice', label: 'quiz.question.types.multiple_choice' },
];

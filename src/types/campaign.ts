// Quiz-related types
export interface QuizConfig {
  title: string;
  type: QuizType;
  allowSkip?: boolean;
  showScore?: boolean;
  randomizeQuestions?: boolean;
  timeLimit?: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  required?: boolean;
  points?: number;
}

export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'long-answer'
  | 'rating'
  | 'scale';

export type QuizType = 'quiz' | 'survey' | 'poll';

// Campaign-related types
export interface Campaign {
  id?: string;
  title?: string;
  type?: string;
  quizConfig?: QuizConfig;
  design?: any;
  settings?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
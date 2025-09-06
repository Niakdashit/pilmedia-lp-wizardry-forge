import { QuizStyleProps } from './quiz-style';

declare global {
  interface Window {
    addEventListener(
      type: 'quizStyleUpdate',
      listener: (event: CustomEvent<QuizStyleProps>) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: 'quizStyleUpdate',
      listener: (event: CustomEvent<QuizStyleProps>) => void,
      options?: boolean | EventListenerOptions
    ): void;
  }
}

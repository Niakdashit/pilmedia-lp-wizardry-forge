// Types pour les styles du quiz
export interface QuizStyleProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  borderRadius?: string;
  // Newly added alignment fields for question and options text
  questionTextAlign?: 'left' | 'center' | 'right' | 'justify';
  optionsTextAlign?: 'left' | 'center' | 'right' | 'justify';
}

// Type pour l'événement de mise à jour des styles
export interface QuizStyleUpdateEvent extends CustomEvent {
  detail: QuizStyleProps;
}

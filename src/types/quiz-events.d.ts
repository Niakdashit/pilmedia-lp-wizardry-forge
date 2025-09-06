// Ce fichier contient les déclarations de types pour les événements personnalisés du quiz

declare global {
  interface WindowEventMap {
    'quizStyleUpdate': CustomEvent<{
      width?: string;
      height?: string;
      backgroundColor?: string;
      textColor?: string;
      buttonBackgroundColor?: string;
      buttonTextColor?: string;
      buttonHoverBackgroundColor?: string;
      buttonActiveBackgroundColor?: string;
      borderRadius?: string;
    }>;
  }
}

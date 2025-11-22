import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { PhoneInput } from './PhoneInput';

export type TypeformLayout =
  | 'centered-card'
  | 'split-left-text-right-image'
  | 'split-left-image-right-text'
  | 'split-left-text-right-image-card'
  | 'scale-horizontal'
  | 'cards-grid'
  | 'fullwidth-input';

export type NavVariant = 'icon-circle' | 'pill-label';
export type ButtonStyle = 'solid' | 'outline' | 'gradient' | 'glass';

export interface SubField {
  id: string;
  label: string; // Label du champ (affiché au-dessus de l'input)
  title?: string; // Titre principal du champ (optionnel, plus grand que le label)
  placeholder?: string;
  type?: 'text' | 'email' | 'phone' | 'number';
  required?: boolean;
  width?: 'full' | 'half' | 'third';
}

export interface PhoneCountry {
  code: string;
  label: string;
  flag: string;
  dialCode: string;
}

export interface TypeformQuestion {
  id: string;
  type:
    | 'text'
    | 'email'
    | 'phone'
    | 'number'
    | 'choice'
    | 'multiple'
    | 'scale'
    | 'long-text'
    | 'welcome'
    | 'thankyou'
    | 'form'; // Nouveau type pour formulaire multi-champs sur une seule page
  text: string;
  description?: string;
  required?: boolean;
  options?: string[];
  optionImages?: string[]; // Images pour chaque option dans les choix multiples
  min?: number;
  max?: number;
  placeholder?: string;
  logic?: Record<string, string>; // { answer: nextQuestionId }
  // Mise en page visuelle (template)
  layout?: TypeformLayout;
  // Image associée (pour les layouts split / cards visuelles)
  imageUrl?: string;
  // Couleur de fond du panneau texte pour les layouts split
  panelBackgroundColor?: string;
  // Background avancé (image, vidéo, gradient)
  backgroundType?: 'color' | 'image' | 'video' | 'gradient';
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundGradient?: string;
  backgroundOverlayOpacity?: number; // 0-1
  backgroundOverlayColor?: string;
  // Typographie personnalisée
  fontFamily?: string; // Google Font name
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  // Navigation et boutons personnalisés
  ctaLabel?: string; // Label du bouton (ex: "Submit inquiry", "OK", "Start")
  navVariant?: NavVariant; // Style de navigation
  buttonStyle?: ButtonStyle; // Style du bouton
  // Multi-champs (ex: first name + last name)
  subFields?: SubField[];
  // Téléphone international
  phoneCountry?: PhoneCountry;
  // Logique conditionnelle avancée
  conditionalLogic?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: any;
    action: 'show' | 'hide' | 'jump';
    target?: string;
  }[];
  // Styles personnalisés pour cloner des designs exacts
  customStyles?: {
    // Styles des boutons/cartes de choix
    optionCardWidth?: string; // ex: "180px", "auto"
    optionCardHeight?: string; // ex: "80px", "auto"
    optionCardBorderRadius?: string; // ex: "12px", "24px"
    optionCardBorder?: string; // ex: "1px solid #E5E7EB"
    optionCardPadding?: string; // ex: "16px 24px"
    optionCardGap?: string; // ex: "12px" (espace entre les cartes)
    optionCardHoverBg?: string; // Couleur au survol
    optionCardSelectedBg?: string; // Couleur quand sélectionné
    optionCardSelectedBorder?: string; // Bordure quand sélectionné
    // Styles du texte dans les options
    optionTextSize?: string; // ex: "16px", "14px"
    optionTextWeight?: string; // ex: "500", "600"
    optionTextColor?: string; // ex: "#20375D"
    // Styles des boutons d'action (Suivant, Précédent)
    buttonBorderRadius?: string; // ex: "24px", "8px"
    buttonPadding?: string; // ex: "12px 24px"
    buttonFontSize?: string; // ex: "16px"
    buttonFontWeight?: string; // ex: "600"
    // Header personnalisé
    showCustomHeader?: boolean;
    headerLogoUrl?: string;
    headerTitle?: string;
    headerSubtitle?: string;
    headerBgColor?: string;
    // Footer personnalisé
    showCustomFooter?: boolean;
    footerItems?: Array<{
      icon?: string;
      title: string;
      description: string;
    }>;
    footerBgColor?: string;
  };
}

interface TypeformPreviewProps {
  questions: TypeformQuestion[];
  onComplete?: (answers: Record<string, any>) => void;
  isPreview?: boolean;
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
  fontFamily?: string;
  colorShades?: {
    dark: string;
    medium: string;
    light: string;
  };
  // Branding persistant
  brandTitle?: string;
  brandLogoUrl?: string;
  showBranding?: boolean;
}

export const TypeformPreview: React.FC<TypeformPreviewProps> = ({
  questions = [],
  onComplete,
  isPreview = false,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  primaryColor = '#841b60',
  device = 'desktop',
  fontFamily = 'Inter, sans-serif',
  colorShades,
  brandTitle,
  brandLogoUrl,
  showBranding = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [validationError, setValidationError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  // Erreurs de validation par champ pour les formulaires
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  // Historique de navigation pour gérer le bouton Précédent avec la logique conditionnelle
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]);
  // Layout de prévisualisation quand il n'y a aucune question
  const [emptyPreviewLayout, setEmptyPreviewLayout] = useState<TypeformLayout>('centered-card');

  const currentQuestion = questions[currentIndex];
  const currentLayout: TypeformLayout = currentQuestion?.layout || 'centered-card';
  const isWelcomeCard = currentQuestion?.type === 'welcome';
  const isThankyouCard = currentQuestion?.type === 'thankyou';
  const isSplitLayout =
    currentLayout === 'split-left-text-right-image' ||
    currentLayout === 'split-left-image-right-text' ||
    currentLayout === 'split-left-text-right-image-card';

  // Générer les teintes si non fournies
  const generateColorShades = (baseColor: string) => {
    const hexToHSL = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    };
    const hslToHex = (h: number, s: number, l: number) => {
      h = h / 360;
      s = s / 100;
      l = l / 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    const hsl = hexToHSL(baseColor);
    return {
      dark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 25, 10)),
      medium: baseColor,
      light: hslToHex(hsl.h, Math.max(hsl.s - 15, 20), Math.min(hsl.l + 30, 90))
    };
  };

  const shades = colorShades || generateColorShades(primaryColor);

  // Fonctions de validation avancée
  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Adresse email invalide';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    // Enlever tous les caractères non numériques sauf le +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Vérifier qu'il y a au moins 10 chiffres
    const digitsOnly = cleanPhone.replace(/\+/g, '');
    if (digitsOnly.length < 10) {
      return 'Numéro de téléphone invalide (minimum 10 chiffres)';
    }
    return '';
  };

  const validateSubField = (value: string, subField: any): string => {
    // Champ requis
    if (subField.required && (!value || value.trim() === '')) {
      return `${subField.label || 'Ce champ'} est requis`;
    }
    
    // Validation spécifique par type
    if (value && value.trim() !== '') {
      if (subField.type === 'email') {
        return validateEmail(value);
      }
      if (subField.type === 'phone') {
        return validatePhone(value);
      }
    }
    
    return '';
  };

  // Fonction de validation
  const validateAnswer = (value: any, type: string): string => {
    // Les cartes spéciales n'ont pas de validation de saisie
    if (type === 'welcome' || type === 'thankyou' || type === 'form') {
      return '';
    }

    if (!value || value === '') {
      if (currentQuestion?.required) {
        return 'Ce champ est requis';
      }
      return '';
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Veuillez entrer une adresse email valide';
        }
        break;
      
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
          return 'Veuillez entrer un numéro de téléphone valide (min. 10 chiffres)';
        }
        break;
      
      case 'number':
        if (isNaN(Number(value))) {
          return 'Veuillez entrer un nombre valide';
        }
        break;
      
      case 'text':
      case 'long-text':
        if (value.length < 2) {
          return 'La réponse doit contenir au moins 2 caractères';
        }
        break;
    }

    return '';
  };

  // Vérifier si la réponse actuelle est valide
  const isCurrentAnswerValid = () => {
    if (!currentQuestion) return false;

    // Les cartes d'accueil / sortie
    if (currentQuestion.type === 'welcome' || currentQuestion.type === 'thankyou') {
      return true;
    }
    
    // Formulaires : valider tous les champs
    if (currentQuestion.type === 'form' && currentQuestion.subFields) {
      const formAnswer = (currentAnswer && typeof currentAnswer === 'object') ? currentAnswer : {};
      
      // Vérifier que tous les champs requis sont remplis et valides
      for (const subField of currentQuestion.subFields) {
        const value = formAnswer[subField.id] || '';
        const error = validateSubField(value, subField);
        
        if (error !== '') {
          return false; // Un champ est invalide
        }
      }
      
      return true; // Tous les champs sont valides
    }
    
    // Si le champ n'est pas requis et vide, c'est valide
    if (!currentQuestion.required && (!currentAnswer || currentAnswer === '')) {
      return true;
    }
    
    // Si le champ est requis ou a une valeur, valider
    const error = validateAnswer(currentAnswer, currentQuestion.type);
    return error === '' && currentAnswer !== '';
  };

  // Réinitialiser les erreurs quand on change de question
  React.useEffect(() => {
    setFieldErrors({});
    setTouchedFields({});
    setValidationError('');
    setTouched(false);
  }, [currentIndex]);

  // Fonction pour évaluer la logique conditionnelle
  const evaluateConditionalLogic = (
    condition: { field: string; operator: string; value: any; action: string; target?: string },
    allAnswers: Record<string, any>
  ): { shouldApply: boolean; target?: string } => {
    const fieldValue = allAnswers[condition.field];
    
    if (fieldValue === undefined) {
      return { shouldApply: false };
    }

    let shouldApply = false;

    switch (condition.operator) {
      case 'equals':
        shouldApply = fieldValue === condition.value;
        break;
      case 'contains':
        shouldApply = String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        break;
      case 'greater':
        shouldApply = Number(fieldValue) > Number(condition.value);
        break;
      case 'less':
        shouldApply = Number(fieldValue) < Number(condition.value);
        break;
    }

    return {
      shouldApply,
      target: condition.target,
    };
  };

  const handleNext = () => {
    if (!currentQuestion || isTransitioning) return;

    // Sauvegarder la réponse
    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);

    // Démarrer la transition
    setIsTransitioning(true);
    setTransitionDirection('forward');

    setTimeout(() => {
      let nextIndex = currentIndex + 1; // Par défaut, question suivante
      let shouldComplete = false;

      // 1. Vérifier la logique conditionnelle avancée
      if (currentQuestion.conditionalLogic && currentQuestion.conditionalLogic.length > 0) {
        for (const condition of currentQuestion.conditionalLogic) {
          const { shouldApply, target } = evaluateConditionalLogic(condition, newAnswers);
          
          if (shouldApply && condition.action === 'jump' && target) {
            const targetIndex = questions.findIndex(q => q.id === target);
            if (targetIndex !== -1) {
              nextIndex = targetIndex;
              break;
            }
          }
        }
      }
      // 2. Vérifier la logique simple (legacy)
      else if (currentQuestion.logic && currentAnswer) {
        const nextQuestionId = currentQuestion.logic[currentAnswer];
        if (nextQuestionId === 'end') {
          shouldComplete = true;
        } else if (nextQuestionId) {
          const targetIndex = questions.findIndex(q => q.id === nextQuestionId);
          if (targetIndex !== -1) {
            nextIndex = targetIndex;
          }
        }
      }

      // 3. Vérifier si on doit terminer
      if (shouldComplete || nextIndex >= questions.length) {
        setIsCompleted(true);
        onComplete?.(newAnswers);
        setIsTransitioning(false);
        return;
      }

      // 4. Naviguer vers la prochaine question et enregistrer dans l'historique
      setCurrentIndex(nextIndex);
      setNavigationHistory([...navigationHistory, nextIndex]);
      setCurrentAnswer('');
      setIsTransitioning(false);
    }, 300); // Durée de l'animation
  };

  const handlePrevious = () => {
    if (navigationHistory.length > 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTransitionDirection('backward');
      
      setTimeout(() => {
        // Retirer l'index actuel de l'historique
        const newHistory = [...navigationHistory];
        newHistory.pop();
        
        // Récupérer l'index précédent dans l'historique
        const previousIndex = newHistory[newHistory.length - 1];
        
        setNavigationHistory(newHistory);
        setCurrentIndex(previousIndex);
        setCurrentAnswer(answers[questions[previousIndex].id] || '');
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Sur une carte d'accueil, Enter avance même sans réponse
      if (isWelcomeCard) {
        e.preventDefault();
        handleNext();
        return;
      }

      if (currentAnswer) {
        e.preventDefault();
        handleNext();
      }
    }
  };

  // Navigation au clavier globale
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Escape pour revenir en arrière
      if (e.key === 'Escape' && currentIndex > 0 && !isTransitioning) {
        e.preventDefault();
        handlePrevious();
      }
      
      // Flèche haut pour revenir en arrière
      if (e.key === 'ArrowUp' && currentIndex > 0 && !isTransitioning) {
        e.preventDefault();
        handlePrevious();
      }
      
      // Flèche bas pour avancer (si réponse donnée)
      if (e.key === 'ArrowDown' && currentAnswer && !isTransitioning) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentIndex, currentAnswer, isTransitioning]);

  // Calculer le pourcentage de progression
  const progressPercentage = questions.length > 0 
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  // Auto-focus sur les inputs quand on change de question
  React.useEffect(() => {
    if (!isTransitioning && currentQuestion) {
      const inputElement = document.querySelector('input[autofocus], textarea[autofocus]') as HTMLElement;
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 100);
      }
    }
  }, [currentIndex, isTransitioning]);

  // Validation en temps réel
  React.useEffect(() => {
    if (touched && currentAnswer && currentQuestion) {
      const error = validateAnswer(currentAnswer, currentQuestion.type);
      setValidationError(error);
    } else if (!currentAnswer) {
      setValidationError('');
    }
  }, [currentAnswer, touched]);

  // Reset validation quand on change de question
  React.useEffect(() => {
    setValidationError('');
    setTouched(false);
  }, [currentIndex]);

  // Charger les Google Fonts dynamiquement
  React.useEffect(() => {
    // Liste des polices personnalisées qui ne sont pas sur Google Fonts
    const customFonts = ['Apercu Pro'];
    
    const fontsToLoad = new Set<string>();
    
    questions.forEach(q => {
      if (q.fontFamily && q.fontFamily !== 'default' && !customFonts.includes(q.fontFamily)) {
        fontsToLoad.add(q.fontFamily);
      }
    });

    if (fontsToLoad.size > 0) {
      const existingLink = document.getElementById('typeform-google-fonts');
      const fontFamilies = Array.from(fontsToLoad).join('|').replace(/ /g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@400;500;600;700&display=swap`;
      
      if (existingLink) {
        existingLink.setAttribute('href', fontUrl);
      } else {
        const link = document.createElement('link');
        link.id = 'typeform-google-fonts';
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
  }, [questions]);

  // Fonction pour obtenir la taille de police
  const getFontSize = (size?: 'small' | 'medium' | 'large' | 'xlarge') => {
    switch (size) {
      case 'small': return { question: '1.5rem', description: '0.875rem' };
      case 'medium': return { question: '2rem', description: '1rem' };
      case 'large': return { question: '2.5rem', description: '1.125rem' };
      case 'xlarge': return { question: '3rem', description: '1.25rem' };
      default: return { question: '2rem', description: '1rem' };
    }
  };

  // Fonction pour obtenir le style de background
  // Toujours retourner la couleur de fond globale du canvas
  const getBackgroundStyle = () => {
    return { backgroundColor };
  };

  // Fonction pour rendre l'overlay si nécessaire
  // Plus utilisé car on n'a plus de backgrounds complexes
  const renderBackgroundOverlay = () => {
    return null;
  };

  // Fonction pour rendre la vidéo de fond si nécessaire
  // Plus utilisé car on n'a plus de backgrounds vidéo
  const renderBackgroundVideo = () => {
    return null;
  };

  const renderBackgroundVideoOLD = () => {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={currentQuestion.backgroundVideo} type="video/mp4" />
      </video>
    );
  };

  const renderNavigation = () => {
    if (!currentQuestion) return null;

    const navVariant = currentQuestion.navVariant || 'icon-circle';
    const buttonStyle = currentQuestion.buttonStyle || 'solid';
    const ctaLabel = currentQuestion.ctaLabel || (isWelcomeCard ? 'Start' : 'OK');

    // Style pill-label (nouveau style avec texte)
    if (navVariant === 'pill-label') {
      const getButtonStyles = () => {
        const baseStyles = {
          fontFamily,
        };

        switch (buttonStyle) {
          case 'outline':
            return {
              ...baseStyles,
              border: `2px solid ${shades.dark}`,
              backgroundColor: 'transparent',
              color: shades.dark,
            };
          case 'gradient':
            return {
              ...baseStyles,
              background: `linear-gradient(135deg, ${shades.medium} 0%, ${shades.dark} 100%)`,
              border: 'none',
              color: '#ffffff',
            };
          case 'glass':
            return {
              ...baseStyles,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
            };
          case 'solid':
          default:
            return {
              ...baseStyles,
              backgroundColor: shades.dark,
              border: 'none',
              color: '#ffffff',
            };
        }
      };

      return (
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswerValid() || !!validationError}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
            style={getButtonStyles()}
          >
            <span className="font-medium text-base">{ctaLabel}</span>
          </button>
          {!isWelcomeCard && (
            <span
              className="text-sm opacity-70 font-light"
              style={{ color: textColor }}
            >
              press Enter ↵
            </span>
          )}
        </div>
      );
    }

    // Style icon-circle (style par défaut)
    // Carte d'accueil avec bouton glass
    if (isWelcomeCard) {
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 group"
            style={{
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
              fontFamily,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="font-medium">{ctaLabel}</span>
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <span
            className="text-sm opacity-70 font-light"
            style={{ color: '#ffffff' }}
          >
            press Enter ↵
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-3">
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full transition-all hover:bg-gray-100 flex items-center justify-center group"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: textColor 
            }}
            aria-label="Question précédente"
          >
            <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!isCurrentAnswerValid() || !!validationError}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 flex items-center justify-center group"
          style={{ backgroundColor: shades.dark }}
          aria-label={currentIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'}
        >
          <ChevronRight size={20} color="#ffffff" className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  };

  const renderEnterShortcut = () => {
    if (!currentQuestion || isWelcomeCard) {
      return null;
    }

    return (
      <div className="mt-4 text-center">
        <span
          className="text-xs"
          style={{ color: textColor, opacity: 0.5 }}
        >
          {currentAnswer ? (
            <>
              <kbd className="px-2 py-1 rounded bg-gray-200 text-xs">↵ Entrée</kbd> pour continuer
            </>
          ) : null}
          {currentIndex > 0 && (
            <>
              {currentAnswer && ' • '}
              <kbd className="px-2 py-1 rounded bg-gray-200 text-xs">↑</kbd> ou{' '}
              <kbd className="px-2 py-1 rounded bg-gray-200 text-xs">Esc</kbd> pour revenir
            </>
          )}
        </span>
      </div>
    );
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    const layout = currentLayout;

    switch (currentQuestion.type) {
      case 'welcome':
      case 'thankyou':
        return null;

      case 'form': {
        // Formulaire multi-champs sur une seule page (pour les informations de contact)
        if (!currentQuestion.subFields || currentQuestion.subFields.length === 0) {
          return null;
        }

        const formAnswer = (currentAnswer && typeof currentAnswer === 'object') 
          ? currentAnswer 
          : {};

        return (
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.subFields.map((subField) => (
                <div 
                  key={subField.id}
                  className={subField.width === 'full' ? 'md:col-span-2' : ''}
                >
                {/* Titre ou Label du champ */}
                {(subField.title || subField.label) && (
                  <div 
                    className={subField.title ? "text-xl md:text-2xl font-semibold mb-3" : "text-sm font-medium mb-2"}
                    style={{ color: textColor, fontFamily }}
                  >
                    {subField.title || subField.label}
                    {subField.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                )}
                
                <div>
                  {subField.type === 'phone' ? (
                    <PhoneInput
                      value={formAnswer[subField.id] || ''}
                      onChange={(value) => {
                        const newAnswer = {
                          ...formAnswer,
                          [subField.id]: value
                        };
                        setCurrentAnswer(newAnswer);
                        
                        // Valider le champ
                        const error = validateSubField(value, subField);
                        setFieldErrors(prev => ({ ...prev, [subField.id]: error }));
                      }}
                      onBlur={() => {
                        setTouchedFields(prev => ({ ...prev, [subField.id]: true }));
                        const error = validateSubField(formAnswer[subField.id] || '', subField);
                        setFieldErrors(prev => ({ ...prev, [subField.id]: error }));
                      }}
                      placeholder={subField.placeholder || 'Phone number'}
                      defaultCountry={currentQuestion.phoneCountry}
                      textColor={textColor}
                      primaryColor={shades.medium}
                      fontFamily={fontFamily}
                      autoFocus={false}
                      validationError=""
                      touched={false}
                    />
                  ) : (
                    <input
                      type={subField.type || 'text'}
                      value={formAnswer[subField.id] || ''}
                      onChange={(e) => {
                        const newAnswer = {
                          ...formAnswer,
                          [subField.id]: e.target.value
                        };
                        setCurrentAnswer(newAnswer);
                        
                        // Valider le champ si déjà touché
                        if (touchedFields[subField.id]) {
                          const error = validateSubField(e.target.value, subField);
                          setFieldErrors(prev => ({ ...prev, [subField.id]: error }));
                        }
                      }}
                      onBlur={() => {
                        setTouchedFields(prev => ({ ...prev, [subField.id]: true }));
                        const error = validateSubField(formAnswer[subField.id] || '', subField);
                        setFieldErrors(prev => ({ ...prev, [subField.id]: error }));
                      }}
                      placeholder={subField.placeholder || ''}
                      className="w-full px-4 py-3 text-base border rounded-lg bg-white outline-none transition-colors focus:ring-2"
                      style={{ 
                        borderColor: touchedFields[subField.id] && fieldErrors[subField.id] 
                          ? '#ef4444' 
                          : formAnswer[subField.id] ? shades.medium : '#e5e7eb',
                        color: textColor,
                        fontFamily
                      }}
                    />
                  )}
                  
                  {/* Message d'erreur par champ */}
                  {touchedFields[subField.id] && fieldErrors[subField.id] && (
                    <div className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                      <span>⚠️</span>
                      <span>{fieldErrors[subField.id]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        );
      }

      case 'text':
      case 'email':
      case 'phone':
      case 'number': {
        // Multi-champs (ex: first name + last name)
        if (currentQuestion.subFields && currentQuestion.subFields.length > 0) {
          const subFieldsAnswer = (currentAnswer && typeof currentAnswer === 'object') 
            ? currentAnswer 
            : {};

          return (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.subFields.map((subField) => (
                  <div 
                    key={subField.id}
                    className={`${
                      subField.width === 'full' ? 'md:col-span-2' : 
                      subField.width === 'third' ? 'md:col-span-1' : 
                      ''
                    }`}
                  >
                    {subField.label && (
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: textColor, fontFamily }}
                      >
                        {subField.label}
                        {subField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    <input
                      type={subField.type || 'text'}
                      value={subFieldsAnswer[subField.id] || ''}
                      onChange={(e) => {
                        setCurrentAnswer({
                          ...subFieldsAnswer,
                          [subField.id]: e.target.value
                        });
                        if (!touched) setTouched(true);
                      }}
                      onBlur={() => setTouched(true)}
                      placeholder={subField.placeholder || ''}
                      className="w-full px-4 py-3 text-lg border-b-2 bg-transparent outline-none transition-colors"
                      style={{ 
                        borderColor: subFieldsAnswer[subField.id] ? shades.medium : '#e5e7eb',
                        color: textColor,
                        fontFamily
                      }}
                      autoFocus={subField.id === currentQuestion.subFields[0].id}
                    />
                  </div>
                ))}
              </div>
              {validationError && touched && (
                <div className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                  <span>⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          );
        }

        // Téléphone avec sélecteur de pays
        if (currentQuestion.type === 'phone' && currentQuestion.phoneCountry) {
          return (
            <PhoneInput
              value={currentAnswer}
              onChange={(value) => {
                setCurrentAnswer(value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder={currentQuestion.placeholder || 'Phone number'}
              defaultCountry={currentQuestion.phoneCountry}
              textColor={textColor}
              primaryColor={shades.medium}
              fontFamily={fontFamily}
              autoFocus={true}
              validationError={validationError}
              touched={touched}
            />
          );
        }

        // Input simple standard
        return (
          <div className="w-full">
            <input
              type={currentQuestion.type === 'number' ? 'number' : 'text'}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              onKeyPress={handleKeyPress}
              placeholder={currentQuestion.placeholder || 'Votre réponse...'}
              className="w-full px-4 py-3 text-lg border-b-2 bg-transparent outline-none transition-colors"
              style={{ 
                borderColor: validationError && touched ? '#ef4444' : currentAnswer ? shades.medium : '#e5e7eb',
                color: textColor,
                fontFamily
              }}
              autoFocus
            />
            {validationError && touched && (
              <div className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
            )}
          </div>
        );
      }

      case 'long-text':
        return (
          <div className="w-full">
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder={currentQuestion.placeholder || 'Votre réponse...'}
              className="w-full px-4 py-3 text-lg border-2 rounded-lg bg-transparent outline-none transition-colors resize-none"
              style={{ 
                borderColor: validationError && touched ? '#ef4444' : currentAnswer ? shades.medium : '#e5e7eb',
                color: textColor,
                minHeight: '120px',
                fontFamily
              }}
              autoFocus
            />
            {validationError && touched && (
              <div className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
            )}
          </div>
        );

      case 'choice':
      case 'multiple': {
        const isMultiple = currentQuestion.type === 'multiple';
        const options = currentQuestion.options || [];

        const handleToggle = (option: string, selected: boolean) => {
          if (!isMultiple) {
            setCurrentAnswer(option);
            return;
          }
          const current = Array.isArray(currentAnswer) ? currentAnswer : [];
          if (selected) {
            setCurrentAnswer(current.filter((a: string) => a !== option));
          } else {
            setCurrentAnswer([...current, option]);
          }
        };

        const isCardsGrid = layout === 'cards-grid';
        const customStyles = currentQuestion.customStyles;

        // Utiliser les styles personnalisés si disponibles, sinon styles par défaut
        const cardWidth = customStyles?.optionCardWidth || 'auto';
        const cardHeight = customStyles?.optionCardHeight || 'auto';
        const cardBorderRadius = customStyles?.optionCardBorderRadius || (isCardsGrid ? '16px' : '8px');
        const cardBorder = customStyles?.optionCardBorder || '2px solid rgba(255, 255, 255, 0.3)';
        const cardPadding = customStyles?.optionCardPadding || (isCardsGrid ? '0' : '24px');
        const cardGap = customStyles?.optionCardGap || (isCardsGrid ? '20px' : '12px');
        const cardHoverBg = customStyles?.optionCardHoverBg;
        const cardSelectedBg = customStyles?.optionCardSelectedBg || primaryColor;
        const cardSelectedBorder = customStyles?.optionCardSelectedBorder || `2px solid ${primaryColor}`;
        const textSize = customStyles?.optionTextSize || '16px';
        const textWeight = customStyles?.optionTextWeight || '500';
        const textColor = customStyles?.optionTextColor || '#20375D';

        const baseButtonClasses = isCardsGrid
          ? 'text-left transition-all overflow-hidden flex flex-col relative group'
          : 'w-full text-left transition-all';

        const containerClasses = isCardsGrid
          ? 'grid gap-4 max-w-5xl mx-auto'
          : 'space-y-3';
        
        // Style de grille adaptatif selon la largeur des cartes
        const gridStyle = isCardsGrid ? {
          gridTemplateColumns: cardWidth === 'auto' ? 'repeat(auto-fit, minmax(150px, 1fr))' : `repeat(auto-fit, ${cardWidth})`,
          gap: cardGap,
        } : {};

        // Lettres pour les labels A, B, C, D...
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        return (
          <div className={containerClasses} style={gridStyle}>
            {options.map((option, idx) => {
              const selected = isMultiple
                ? Array.isArray(currentAnswer) && currentAnswer.includes(option)
                : currentAnswer === option;

              return (
                <button
                  key={idx}
                  onClick={() => handleToggle(option, selected)}
                  className={baseButtonClasses}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: cardBorderRadius,
                    border: selected ? cardSelectedBorder : cardBorder,
                    padding: cardPadding,
                    backgroundColor: selected 
                      ? cardSelectedBg 
                      : (cardHoverBg ? 'white' : (isCardsGrid ? 'rgba(255, 255, 255, 0.95)' : 'transparent')),
                    color: selected && cardSelectedBg ? 'white' : textColor,
                    fontSize: textSize,
                    fontWeight: textWeight,
                    fontFamily,
                  }}
                  onMouseEnter={(e) => {
                    if (!selected && cardHoverBg) {
                      e.currentTarget.style.backgroundColor = cardHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected && cardHoverBg) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {isCardsGrid ? (
                    customStyles ? (
                      // Design personnalisé (Figaro) - Simple avec icône et texte
                      <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
                        {/* Icône placeholder (peut être remplacée par optionImages) */}
                        {currentQuestion.optionImages?.[idx] ? (
                          <img 
                            src={currentQuestion.optionImages[idx]} 
                            alt={option}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-2xl">👤</span>
                          </div>
                        )}
                        {/* Texte */}
                        <span className="text-center">{option}</span>
                      </div>
                    ) : (
                    // Design par défaut avec image
                    <>
                      {/* Image de la carte */}
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                        {(currentQuestion.optionImages?.[idx] || currentQuestion.imageUrl) ? (
                          <img
                            src={currentQuestion.optionImages?.[idx] || currentQuestion.imageUrl}
                            alt={option}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 px-3 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                                <span className="text-lg">🖼️</span>
                              </div>
                              <span className="text-[10px]">Ajouter une image</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Badge avec lettre A/B/C/D */}
                        <div 
                          className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                          style={{
                            backgroundColor: selected ? primaryColor : 'rgba(0, 0, 0, 0.7)',
                            color: '#ffffff',
                            border: selected ? `2px solid ${primaryColor}` : '2px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {letters[idx]}
                        </div>

                        {/* Icône de sélection */}
                        {selected && (
                          <div 
                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Check size={16} color="#ffffff" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Texte de la carte */}
                      <div className="px-4 py-4 flex items-center justify-center min-h-[60px]">
                        <span className="text-sm md:text-base font-semibold leading-tight text-center">{option}</span>
                      </div>
                    </>
                    )
                  ) : (
                    // Layout liste (non cards-grid)
                    <div className="flex items-center justify-between">
                      <span className="text-lg" style={{ fontFamily }}>{option}</span>
                      {selected && (
                        <Check size={18} style={{ color: shades.dark }} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      }

      case 'scale': {
        const min = currentQuestion.min ?? 0;
        const max = currentQuestion.max ?? 10;
        const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

        // Labels pour les extrémités de l'échelle (personnalisables via description)
        const scaleLabels = currentQuestion.description?.split('|') || [];
        const leftLabel = scaleLabels[0]?.trim() || '';
        const rightLabel = scaleLabels[2]?.trim() || '';

        if (currentLayout === 'scale-horizontal') {
          return (
            <div className="w-full max-w-4xl mx-auto space-y-4">
              {/* Échelle horizontale style Typeform */}
              <div className="flex justify-center gap-2 md:gap-3 mb-6">
                {values.map((value) => (
                  <button
                    key={value}
                    onClick={() => setCurrentAnswer(value)}
                    className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl transition-all duration-200 flex items-center justify-center group"
                    style={{
                      border: `2px solid ${currentAnswer === value ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                      backgroundColor: currentAnswer === value ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <span className="text-lg md:text-xl font-medium">{value}</span>
                  </button>
                ))}
              </div>

              {/* Labels sous l'échelle */}
              {(leftLabel || rightLabel) && (
                <div className="flex justify-between items-start text-sm md:text-base px-1">
                  <span 
                    className="text-left opacity-80 font-light" 
                    style={{ color: '#ffffff' }}
                  >
                    {leftLabel}
                  </span>
                  <span 
                    className="text-right opacity-80 font-light" 
                    style={{ color: '#ffffff' }}
                  >
                    {rightLabel}
                  </span>
                </div>
              )}
            </div>
          );
        }

        // Layout par défaut (vertical ou compact)
        return (
          <div className="flex justify-center gap-3">
            {values.map((value) => (
                <button
                  key={value}
                  onClick={() => setCurrentAnswer(value)}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all hover:shadow-md flex items-center justify-center"
                  style={{
                    borderColor: currentAnswer === value ? shades.dark : '#e5e7eb',
                    backgroundColor: currentAnswer === value ? shades.dark : 'transparent',
                    color: currentAnswer === value ? '#ffffff' : textColor,
                    fontFamily
                  }}
                >
                  <span className="text-base md:text-lg font-medium">{value}</span>
                </button>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const wrapWithDeviceViewport = (node: React.ReactNode) => {
    if (device === 'mobile') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="rounded-[32px] overflow-hidden shadow-lg border border-gray-200 bg-white"
            style={{ width: 375, height: 667 }}
          >
            {node}
          </div>
        </div>
      );
    }
    return node;
  };

  if (questions.length === 0) {
    const layoutItems: { id: TypeformLayout; label: string; icon: React.ReactNode }[] = [
      {
        id: 'centered-card',
        label: 'Carte centrée',
        icon: (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-3/4 h-3 bg-gray-300 rounded" />
            <div className="w-1/2 h-2 bg-gray-200 rounded" />
          </div>
        ),
      },
      {
        id: 'split-left-text-right-image',
        label: 'Texte gauche / Image droite',
        icon: (
          <div className="w-full h-full grid grid-cols-[3fr,2fr] gap-1">
            <div className="flex flex-col justify-center gap-2 px-2">
              <div className="w-3/4 h-2 bg-gray-300 rounded" />
              <div className="w-2/3 h-2 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-300 rounded" />
          </div>
        ),
      },
      {
        id: 'split-left-image-right-text',
        label: 'Image gauche / Texte droite',
        icon: (
          <div className="w-full h-full grid grid-cols-[2fr,3fr] gap-1">
            <div className="bg-gray-300 rounded" />
            <div className="flex flex-col justify-center gap-2 px-2">
              <div className="w-3/4 h-2 bg-gray-300 rounded" />
              <div className="w-2/3 h-2 bg-gray-200 rounded" />
            </div>
          </div>
        ),
      },
      {
        id: 'split-left-text-right-image-card',
        label: 'Texte gauche / Image card arrondie',
        icon: (
          <div className="w-full h-full grid grid-cols-[3fr,2fr] gap-1">
            <div className="flex flex-col justify-center gap-2 px-2">
              <div className="w-3/4 h-2 bg-gray-300 rounded" />
              <div className="w-2/3 h-2 bg-gray-200 rounded" />
            </div>
            <div className="bg-gray-300 rounded-full" />
          </div>
        ),
      },
      {
        id: 'scale-horizontal',
        label: 'Échelle horizontale',
        icon: (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-2">
            <div className="w-3/4 h-2 bg-gray-300 rounded" />
            <div className="flex gap-1 justify-center">
              {[1,2,3,4,5].map((v) => (
                <div key={v} className="w-4 h-4 rounded-full border border-gray-300" />
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'cards-grid',
        label: 'Grille de cartes',
        icon: (
          <div className="w-full h-full grid grid-cols-2 gap-1 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-300 rounded flex flex-col">
                <div className="w-full h-6 bg-gray-200 rounded-t" />
                <div className="flex-1 px-2 py-1 flex items-center">
                  <div className="w-3/4 h-2 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'fullwidth-input',
        label: 'Champ pleine largeur',
        icon: (
          <div className="w-full h-full flex flex-col justify-center gap-3 px-3">
            <div className="w-2/3 h-2 bg-gray-300 rounded" />
            <div className="w-full h-3 bg-gray-200 rounded-full" />
          </div>
        ),
      },
    ];

    return wrapWithDeviceViewport(
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="w-full max-w-5xl md:max-w-6xl px-6 md:px-10 py-10">
          <div className="text-center mb-8">
            <h3
              className="text-2xl font-bold"
              style={{ color: textColor }}
            >
              Layout
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {layoutItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setEmptyPreviewLayout(item.id)}
                className={`relative aspect-[5/3] rounded-2xl border transition-all bg-white shadow-sm flex flex-col overflow-hidden ${
                  emptyPreviewLayout === item.id
                    ? 'border-[#841b60] ring-2 ring-[#841b60]/30'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex-1 p-4">
                  {item.icon}
                </div>
                <div className="px-4 py-3 border-t border-gray-100 text-xs md:text-sm text-gray-700 text-left">
                  {item.label}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  const event = new CustomEvent('typeform-open-templates-from-preview');
                  window.dispatchEvent(event);
                } catch (e) {
                  console.error('Erreur lors de l\'émission de typeform-open-templates', e);
                }
              }}
              className="px-5 py-2 rounded-full text-sm font-medium border border-[#841b60] text-[#841b60] bg-white hover:bg-[#f9f0f6] transition-colors shadow-sm"
            >
              Templates
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  const event = new CustomEvent('typeform-empty-layout-apply', {
                    detail: { layout: emptyPreviewLayout },
                  });
                  window.dispatchEvent(event);
                } catch (e) {
                  console.error('Erreur lors de l\'émission de typeform-empty-layout-apply', e);
                }
              }}
              className="px-6 py-2 rounded-full text-sm font-medium text-white bg-[#841b60] hover:bg-[#6d1650] transition-colors shadow-sm"
            >
              Créer une question avec ce layout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return wrapWithDeviceViewport(
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor }}
      >
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: textColor, fontFamily }}>
            Merci !
          </h2>
          <p className="text-xl mb-6" style={{ color: textColor, opacity: 0.7, fontFamily }}>
            Vos réponses ont été enregistrées
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setAnswers({});
              setCurrentAnswer('');
              setIsCompleted(false);
              setNavigationHistory([0]);
            }}
            className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: shades.dark, fontFamily }}
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return wrapWithDeviceViewport(
    <>
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutToLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-30px);
          }
        }
        
        @keyframes slideOutToRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(30px);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .question-enter-forward {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        
        .question-enter-backward {
          animation: slideInFromLeft 0.3s ease-out forwards;
        }
        
        .question-exit-forward {
          animation: slideOutToLeft 0.3s ease-out forwards;
        }
        
        .question-exit-backward {
          animation: slideOutToRight 0.3s ease-out forwards;
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
      <div
        className="w-full h-full flex flex-col overflow-hidden relative"
        style={getBackgroundStyle()}
      >
        {/* Vidéo de fond si nécessaire */}
        {renderBackgroundVideo()}
        
        {/* Overlay si nécessaire */}
        {renderBackgroundOverlay()}
        
        {/* Branding persistant */}
        {showBranding && (brandTitle || brandLogoUrl) && (
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            {brandLogoUrl && (
              <img 
                src={brandLogoUrl} 
                alt={brandTitle || 'Logo'} 
                className="h-8 w-auto object-contain"
              />
            )}
            {brandTitle && (
              <h1 
                className="text-xl md:text-2xl font-bold tracking-tight"
                style={{ 
                  color: textColor,
                  fontFamily: currentQuestion?.fontFamily || fontFamily,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {brandTitle}
              </h1>
            )}
          </div>
        )}
        
        {/* Progress Bar */}
        {questions.length > 0 && !isCompleted && (
          <div className="w-full h-1 bg-gray-200 relative overflow-hidden z-10">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: shades.medium,
              }}
            />
          </div>
        )}
        
        {/* Contenu principal */}
        <div className="flex-1 flex items-stretch overflow-auto relative z-10">
          <div className="w-full flex flex-col items-stretch min-h-full">
            {/* Zone question + input (layout dépendant) */}
            <div
              className={`flex-1 flex ${
                isSplitLayout ? 'items-stretch' : 'items-center justify-center'
              } ${
                isTransitioning 
                  ? transitionDirection === 'forward' 
                    ? 'question-exit-forward' 
                    : 'question-exit-backward'
                  : transitionDirection === 'forward'
                    ? 'question-enter-forward'
                    : 'question-enter-backward'
              }`}
              key={currentIndex}
            >
            {isSplitLayout ? (
              device === 'mobile' ? (
                // Layout split en mobile : pile verticale image + texte
                <div className="w-full h-full flex flex-col">
                  {/* Bloc image en haut */}
                  <div className="w-full" style={{ flexBasis: '45%', maxHeight: '55%' }}>
                    <div className="w-full h-full">
                      {currentQuestion?.imageUrl ? (
                        <img
                          src={currentQuestion.imageUrl}
                          alt="Question visuelle"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300 text-center px-6 py-8">
                          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                            <span className="text-[11px] font-medium text-gray-400">Image</span>
                          </div>
                          <p className="text-xs text-gray-500 max-w-xs">
                            Ajoutez une image dans le champ "Image" de la question pour remplir cette zone.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloc texte en bas */}
                  <div
                    className="flex-1 flex flex-col justify-start px-6 py-6"
                    style={{ backgroundColor: currentQuestion?.panelBackgroundColor || backgroundColor }}
                  >
                    {/* Numéro de question */}
                    <div className="mb-3">
                      <span
                        className="text-xs font-medium tracking-wide"
                        style={{ color: textColor, opacity: 0.6 }}
                      >
                        {currentIndex + 1} / {questions.length}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="mb-6">
                      <h2
                        className="font-bold mb-2 leading-snug"
                        style={{ 
                          color: textColor,
                          fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                            ? `'${currentQuestion.fontFamily}', sans-serif` 
                            : fontFamily,
                          fontSize: getFontSize(currentQuestion?.fontSize).question
                        }}
                      >
                        {currentQuestion?.text
                          ?.split('\n')
                          .map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              {idx < (currentQuestion.text?.split('\n').length || 0) - 1 && <br />}
                            </React.Fragment>
                          ))}
                        {currentQuestion?.required && (
                          <span style={{ color: shades.medium }}> *</span>
                        )}
                      </h2>
                      {currentQuestion?.description && (
                        <p
                          style={{ 
                            color: textColor, 
                            opacity: 0.7,
                            fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                              ? `'${currentQuestion.fontFamily}', sans-serif` 
                              : undefined,
                            fontSize: getFontSize(currentQuestion?.fontSize).description
                          }}
                        >
                          {currentQuestion.description}
                        </p>
                      )}
                    </div>

                    {/* Input */}
                    <div className="mb-5">
                      {renderInput()}
                    </div>

                    {/* Navigation + raccourci clavier */}
                    <div className="mt-auto pt-2">
                      {renderNavigation()}
                      {renderEnterShortcut()}
                    </div>
                  </div>
                </div>
              ) : currentLayout === 'split-left-text-right-image-card' ? (
                // Layout avec image card arrondie compacte à droite
                <div className="w-full h-full flex items-center justify-center px-8 md:px-16">
                  <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Colonne texte à gauche */}
                    <div className="flex flex-col justify-center">
                      {/* Numéro de question */}
                      <div className="mb-4">
                        <span
                          className="text-sm font-medium tracking-wide"
                          style={{ color: textColor, opacity: 0.6 }}
                        >
                          {currentIndex + 1} / {questions.length}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="mb-8">
                        <h2
                          className="font-bold mb-3 leading-tight"
                          style={{ 
                            color: textColor,
                            fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                              ? `'${currentQuestion.fontFamily}', sans-serif` 
                              : fontFamily,
                            fontSize: currentQuestion?.fontSize === 'xlarge' ? '3.5rem' : 
                                     currentQuestion?.fontSize === 'large' ? '3rem' :
                                     currentQuestion?.fontSize === 'small' ? '2rem' : '2.5rem'
                          }}
                        >
                          {currentQuestion?.text
                            ?.split('\n')
                            .map((line, idx) => (
                              <React.Fragment key={idx}>
                                {line}
                                {idx < (currentQuestion.text?.split('\n').length || 0) - 1 && <br />}
                              </React.Fragment>
                            ))}
                          {currentQuestion?.required && (
                            <span style={{ color: shades.medium }}> *</span>
                          )}
                        </h2>
                        {currentQuestion?.description && (
                          <p
                            style={{ 
                              color: textColor, 
                              opacity: 0.7,
                              fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                                ? `'${currentQuestion.fontFamily}', sans-serif` 
                                : fontFamily,
                              fontSize: getFontSize(currentQuestion?.fontSize).description
                            }}
                          >
                            {currentQuestion.description}
                          </p>
                        )}
                      </div>

                      {/* Navigation + raccourci clavier */}
                      <div className="flex flex-col items-start gap-3">
                        {renderNavigation()}
                        {renderEnterShortcut()}
                      </div>
                    </div>

                    {/* Colonne image card arrondie à droite */}
                    <div className="flex items-center justify-center">
                      {currentQuestion?.imageUrl ? (
                        <img
                          src={currentQuestion.imageUrl}
                          alt="Question visuelle"
                          className="w-full max-w-2xl aspect-square object-cover rounded-3xl shadow-2xl"
                        />
                      ) : (
                        <div className="w-full max-w-2xl aspect-square flex flex-col items-center justify-center bg-gray-300 text-center rounded-3xl shadow-2xl">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center mb-4">
                            <span className="text-xs font-medium text-gray-500">Image</span>
                          </div>
                          <p className="text-sm text-gray-600 max-w-xs px-8">
                            Ajoutez une image dans le champ "Image" de la question pour remplir cette zone.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Layout split desktop/tablette : grille 2 colonnes pleine hauteur
                <div className="w-full h-full grid md:grid-cols-2">
                  {/* Colonne texte pleine hauteur (couleur personnalisable, blanc par défaut) */}
                  <div
                    className={
                      currentLayout === 'split-left-image-right-text'
                        ? 'md:order-2'
                        : ''
                    }
                    style={{ backgroundColor: currentQuestion?.panelBackgroundColor || backgroundColor }}
                  >
                    <div className="h-full flex flex-col justify-center px-10 lg:px-16">
                      {/* Numéro de question */}
                      <div className="mb-6">
                        <span
                          className="text-sm font-medium tracking-wide"
                          style={{ color: textColor, opacity: 0.6 }}
                        >
                          {currentIndex + 1} / {questions.length}
                        </span>
                      </div>

                      {/* Question */}
                      <div className="mb-10">
                      <h2
                        className="font-bold mb-3 leading-tight"
                        style={{ 
                          color: textColor,
                          fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                            ? `'${currentQuestion.fontFamily}', sans-serif` 
                            : fontFamily,
                          fontSize: currentQuestion?.fontSize === 'xlarge' ? '3.5rem' : 
                                   currentQuestion?.fontSize === 'large' ? '3rem' :
                                   currentQuestion?.fontSize === 'small' ? '2rem' : '2.5rem'
                        }}
                      >
                        {currentQuestion?.text
                          ?.split('\n')
                          .map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              {idx < (currentQuestion.text?.split('\n').length || 0) - 1 && <br />}
                            </React.Fragment>
                          ))}
                        {currentQuestion?.required && (
                          <span style={{ color: shades.medium }}> *</span>
                        )}
                      </h2>
                        {currentQuestion?.description && (
                        <p
                          style={{ 
                            color: textColor, 
                            opacity: 0.7,
                            fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                              ? `'${currentQuestion.fontFamily}', sans-serif` 
                              : fontFamily,
                            fontSize: getFontSize(currentQuestion?.fontSize).description
                          }}
                        >
                          {currentQuestion.description}
                        </p>
                        )}
                      </div>

                      {/* Input */}
                      <div className="max-w-xl mb-8">
                        {renderInput()}
                      </div>

                      {/* Navigation + raccourci clavier pour les layouts split */}
                      <div className="mt-6 flex flex-col items-start gap-3">
                        {renderNavigation()}
                        {renderEnterShortcut()}
                      </div>
                    </div>
                  </div>

                  {/* Colonne image pleine hauteur */}
                  <div
                    className={
                      currentLayout === 'split-left-image-right-text'
                        ? 'md:order-1'
                        : ''
                    }
                  >
                    <div className="w-full h-full">
                      {currentQuestion?.imageUrl ? (
                        <img
                          src={currentQuestion.imageUrl}
                          alt="Question visuelle"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300 text-center px-8">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                            <span className="text-xs font-medium text-gray-400">Image</span>
                          </div>
                          <p className="text-sm text-gray-500 max-w-xs">
                            Ajoutez une image dans le champ "Image" de la question pour remplir cette zone.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              // Layouts centrés (par défaut)
              <div className="w-full h-full flex items-center justify-center py-8">
                <div
                  className={`w-full px-8 md:px-16 ${
                    currentLayout === 'fullwidth-input'
                      ? 'max-w-3xl'
                      : currentLayout === 'cards-grid'
                        ? 'max-w-6xl'
                        : (isWelcomeCard || isThankyouCard)
                          ? 'max-w-4xl'
                          : 'max-w-2xl'
                  }`}
                >
                {/* Numéro de question */}
                <div className="mb-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: textColor, opacity: 0.6 }}
                  >
                    {currentIndex + 1} / {questions.length}
                  </span>
                </div>

                {/* Image pour cartes welcome/thankyou */}
                {(currentQuestion?.type === 'welcome' || currentQuestion?.type === 'thankyou') && currentQuestion?.imageUrl && (
                  <div className="mb-8 flex justify-center">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Card visual"
                      className="max-w-full h-auto rounded-2xl shadow-lg"
                      style={{ maxHeight: '300px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Question */}
                <div className="mb-8">
                  <h2
                    className="font-bold mb-2"
                    style={{ 
                      color: textColor,
                      fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                        ? `'${currentQuestion.fontFamily}', sans-serif` 
                        : undefined,
                      fontSize: getFontSize(currentQuestion?.fontSize).question
                    }}
                  >
                    {currentQuestion?.text}
                    {currentQuestion?.required && (
                      <span style={{ color: primaryColor }}> *</span>
                    )}
                  </h2>
                  {currentQuestion?.description && (
                          <p
                            style={{ 
                              color: textColor, 
                              opacity: 0.7,
                              fontFamily: currentQuestion?.fontFamily && currentQuestion.fontFamily !== 'default' 
                                ? `'${currentQuestion.fontFamily}', sans-serif` 
                                : fontFamily,
                              fontSize: getFontSize(currentQuestion?.fontSize).description
                            }}
                          >
                            {currentQuestion.description}
                          </p>
                  )}
                </div>

                  {/* Input */}
                  <div className="mb-8">{renderInput()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation en bas pour les layouts non-split */}
          {!isSplitLayout && (
            <div className="w-full flex flex-col items-center gap-3 pb-8">
              {renderNavigation()}
              {renderEnterShortcut()}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default TypeformPreview;

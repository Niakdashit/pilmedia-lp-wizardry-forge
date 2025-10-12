import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ButtonStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  borderWidth: number;
  width: string;
  fontSize: number;
  fontWeight: string;
  padding: string;
}

export interface ButtonState {
  buttonStyle: ButtonStyle;
  setButtonStyle: (property: keyof ButtonStyle, value: any) => void;
  updateButtonStyle: (updates: Partial<ButtonStyle>) => void;
  resetButtonStyle: () => void;
}

const defaultButtonStyle: ButtonStyle = {
  bgColor: '#000000',
  textColor: '#ffffff',
  borderColor: '#000000',
  borderRadius: 9999, // rounded-full par défaut
  borderWidth: 0,
  width: '100%',
  fontSize: 16,
  fontWeight: '600',
  padding: '12px 24px'
};

/**
 * Store Zustand persistant pour le style global des boutons
 * Synchronise automatiquement tous les boutons du funnel
 */
export const useButtonStore = create<ButtonState>()(
  persist(
    (set) => ({
      buttonStyle: defaultButtonStyle,

      setButtonStyle: (property, value) =>
        set((state) => ({
          buttonStyle: { ...state.buttonStyle, [property]: value }
        })),

      updateButtonStyle: (updates) =>
        set((state) => ({
          buttonStyle: { ...state.buttonStyle, ...updates }
        })),

      resetButtonStyle: () =>
        set({ buttonStyle: defaultButtonStyle })
    }),
    {
      name: 'pilmedia-button-style',
      version: 1
    }
  )
);

/**
 * Hook pour obtenir le style CSS d'un bouton
 * Convertit les propriétés du store en objet CSS React
 */
export const useButtonStyleCSS = () => {
  const { buttonStyle } = useButtonStore();

  return {
    backgroundColor: buttonStyle.bgColor,
    color: buttonStyle.textColor,
    borderColor: buttonStyle.borderColor,
    borderRadius: `${buttonStyle.borderRadius}px`,
    borderWidth: `${buttonStyle.borderWidth}px`,
    borderStyle: buttonStyle.borderWidth > 0 ? 'solid' : 'none',
    width: buttonStyle.width,
    fontSize: `${buttonStyle.fontSize}px`,
    fontWeight: buttonStyle.fontWeight,
    padding: buttonStyle.padding,
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };
};

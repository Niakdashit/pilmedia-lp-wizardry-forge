import React from 'react';
import { Undo, Redo } from 'lucide-react';

interface UndoRedoButtonsProps {
  /** Fonction pour annuler */
  onUndo: () => void;
  /** Fonction pour rétablir */
  onRedo: () => void;
  /** Peut-on annuler ? */
  canUndo: boolean;
  /** Peut-on rétablir ? */
  canRedo: boolean;
  /** Taille des boutons (défaut: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de style (défaut: 'default') */
  variant?: 'default' | 'ghost' | 'outline';
  /** Classe CSS personnalisée */
  className?: string;
  /** Afficher les tooltips ? (défaut: true) */
  showTooltips?: boolean;
  /** Orientation (défaut: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Composant de boutons Undo/Redo réutilisable
 * 
 * @example
 * ```tsx
 * <UndoRedoButtons
 *   onUndo={undo}
 *   onRedo={redo}
 *   canUndo={canUndo}
 *   canRedo={canRedo}
 * />
 * ```
 */
export const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  size = 'md',
  variant = 'default',
  className = '',
  showTooltips = true,
  orientation = 'horizontal'
}) => {
  // Classes de taille
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-3'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Classes de variante
  const variantClasses = {
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  // Classes de base pour les boutons
  const baseButtonClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded
    transition-colors
    duration-200
    flex
    items-center
    justify-center
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-1
  `;

  // Classes pour les boutons désactivés
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:bg-gray-700';

  // Classes de conteneur selon l'orientation
  const containerClasses = orientation === 'horizontal' 
    ? 'flex flex-row space-x-1' 
    : 'flex flex-col space-y-1';

  const UndoButton = (
    <button
      onClick={onUndo}
      disabled={!canUndo}
      className={`
        ${baseButtonClasses}
        ${!canUndo ? disabledClasses : ''}
      `}
      title={showTooltips ? `Annuler (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Z)` : undefined}
      aria-label="Annuler la dernière action"
    >
      <Undo className={iconSizeClasses[size]} />
    </button>
  );

  const RedoButton = (
    <button
      onClick={onRedo}
      disabled={!canRedo}
      className={`
        ${baseButtonClasses}
        ${!canRedo ? disabledClasses : ''}
      `}
      title={showTooltips ? `Rétablir (${navigator.platform.includes('Mac') ? 'Cmd+Shift' : 'Ctrl+Y'}+Z)` : undefined}
      aria-label="Rétablir la dernière action annulée"
    >
      <Redo className={iconSizeClasses[size]} />
    </button>
  );

  return (
    <div className={`${containerClasses} ${className}`}>
      {UndoButton}
      {RedoButton}
    </div>
  );
};

/**
 * Version compacte des boutons undo/redo pour les barres d'outils
 */
export const CompactUndoRedoButtons: React.FC<Omit<UndoRedoButtonsProps, 'size' | 'variant'>> = (props) => (
  <UndoRedoButtons {...props} size="sm" variant="ghost" />
);

/**
 * Version avec séparateur pour intégration dans une toolbar
 */
export const ToolbarUndoRedoButtons: React.FC<UndoRedoButtonsProps & { withSeparator?: boolean }> = ({
  withSeparator = true,
  ...props
}) => (
  <div className="flex items-center">
    {withSeparator && <div className="w-px h-6 bg-gray-300 mx-2" />}
    <UndoRedoButtons {...props} />
    {withSeparator && <div className="w-px h-6 bg-gray-300 mx-2" />}
  </div>
);

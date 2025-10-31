/**
 * Unified Editor Props Interfaces
 * 
 * Standardized props for all editor layouts to ensure consistency
 * and enable better reusability across the application.
 */

/**
 * Base props that all editor layouts should support
 */
export interface BaseEditorLayoutProps {
  /**
   * Editor mode - determines save behavior and UI context
   * - 'template': Editing a reusable template
   * - 'campaign': Editing an active campaign
   */
  mode?: 'template' | 'campaign';
  
  /**
   * List of tab IDs to hide from the sidebar
   * Common tabs: 'text', 'images', 'shapes', 'background', 'settings', etc.
   */
  hiddenTabs?: string[];
}

/**
 * Extended props for editors that support form overlays
 * Currently used by: ModelEditor, FormEditor
 */
export interface ExtendedEditorLayoutProps extends BaseEditorLayoutProps {
  /**
   * Whether to show a form overlay on top of the canvas
   * Used for form-centric editors
   */
  showFormOverlay?: boolean;
}

/**
 * Props for game-specific editors (Quiz, Wheel, Scratch, Jackpot)
 */
export interface GameEditorLayoutProps extends BaseEditorLayoutProps {
  /**
   * Initial game configuration (optional)
   * Allows pre-loading a game state when opening the editor
   */
  initialGameConfig?: any;
  
  /**
   * Callback when game configuration changes
   * Useful for parent components that need to track game state
   */
  onGameConfigChange?: (config: any) => void;
}

/**
 * Type guard to check if props include form overlay support
 */
export function hasFormOverlaySupport(
  props: BaseEditorLayoutProps
): props is ExtendedEditorLayoutProps {
  return 'showFormOverlay' in props;
}

/**
 * Type guard to check if props include game config support
 */
export function hasGameConfigSupport(
  props: BaseEditorLayoutProps
): props is GameEditorLayoutProps {
  return 'initialGameConfig' in props || 'onGameConfigChange' in props;
}

/**
 * Default values for editor props
 */
export const DEFAULT_EDITOR_PROPS: Required<Pick<BaseEditorLayoutProps, 'mode' | 'hiddenTabs'>> = {
  mode: 'campaign',
  hiddenTabs: []
};

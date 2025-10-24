import React from 'react';
import { useSearchParams } from 'react-router-dom';

interface ArticleEditorDetectorProps {
  campaignType: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form' | 'dice' | 'memory' | 'puzzle';
  fullscreenLayout: React.ReactNode;
}

/**
 * ArticleEditorDetector - Composant de détection et routing entre modes
 * 
 * Détecte le paramètre ?mode dans l'URL et rend:
 * - ArticleEditorLayout si mode=article
 * - Layout fullscreen existant si mode=fullscreen ou par défaut
 * 
 * Usage dans un éditeur existant:
 * ```tsx
 * return (
 *   <ArticleEditorDetector 
 *     campaignType="wheel"
 *     fullscreenLayout={<DesignEditorLayout />}
 *   />
 * );
 * ```
 */
const ArticleEditorDetector: React.FC<ArticleEditorDetectorProps> = ({
  campaignType,
  fullscreenLayout,
}) => {
  const [searchParams] = useSearchParams();
  

  // Le DesignEditorLayout gère désormais directement le mode Article via la prop editorMode
  // On réutilise donc le même layout quelle que soit la valeur du mode
  return <>{fullscreenLayout}</>;
};

export default ArticleEditorDetector;

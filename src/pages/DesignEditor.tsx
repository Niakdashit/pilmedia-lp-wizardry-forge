import React from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

/**
 * DesignEditor - Éditeur de campagne Roue de la Fortune
 * 
 * Supporte maintenant deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const DesignEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="wheel"
      fullscreenLayout={<DesignEditorLayout />}
    />
  );
};

export default DesignEditor;
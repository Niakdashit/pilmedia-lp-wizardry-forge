import React from 'react';
import ScratchCardEditorLayout from '../components/ScratchCardEditor/ScratchCardEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

/**
 * ScratchCardEditor - Éditeur de campagne Carte à Gratter
 * 
 * Supporte deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const ScratchCardEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="scratch"
      fullscreenLayout={<ScratchCardEditorLayout />}
    />
  );
};

export default ScratchCardEditor;

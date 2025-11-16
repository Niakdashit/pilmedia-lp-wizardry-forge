import React from 'react';
import JackpotEditorLayout from '../components/JackpotEditor/JackpotEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

/**
 * JackpotEditor - Éditeur de campagne Jackpot
 * 
 * Supporte deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const JackpotEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="jackpot"
      fullscreenLayout={<JackpotEditorLayout mode="campaign" />}
    />
  );
};

export default JackpotEditor;

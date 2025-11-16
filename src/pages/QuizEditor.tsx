import React from 'react';
import QuizEditorLayout from '../components/QuizEditor/DesignEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

/**
 * QuizEditor - Éditeur de campagne Quiz
 * 
 * Supporte deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const QuizEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="quiz"
      fullscreenLayout={<QuizEditorLayout mode="campaign" />}
    />
  );
};

export default QuizEditor;

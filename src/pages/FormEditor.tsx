import React from 'react';
import FormEditorLayout from '../components/FormEditor/DesignEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

/**
 * FormEditor - Éditeur de campagne Formulaire
 * 
 * Supporte deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const FormEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="form"
      fullscreenLayout={<FormEditorLayout mode="campaign" />}
    />
  );
};

export default FormEditor;

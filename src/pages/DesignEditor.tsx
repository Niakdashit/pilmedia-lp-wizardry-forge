import React from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';

/**
 * DesignEditor - Éditeur de campagne Roue de la Fortune
 * 
 * Supporte maintenant deux modes:
 * - Fullscreen: Éditeur complet avec tous les modules (?mode=fullscreen ou par défaut)
 * - Article: Mode simplifié avec bannière + texte + CTA (?mode=article)
 */
const DesignEditor: React.FC = () => {
  return <DesignEditorLayout />;
};

export default DesignEditor;
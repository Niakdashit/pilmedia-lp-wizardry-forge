import React from 'react';
import ModelEditorLayout from '../components/ModelEditor/DesignEditorLayout';

// FormEditor: clean base editor using the ModelEditor layout in template mode
const FormEditor: React.FC = () => {
  // Activer l'overlay formulaire et rendre l'onglet Formulaire visible par défaut
  return (
    <ModelEditorLayout 
      mode="template" 
      showFormOverlay 
      hiddenTabs={['campaign', 'export']}
    />
  );
};

export default FormEditor;

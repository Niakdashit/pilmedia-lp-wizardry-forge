import React from 'react';
import ModelEditorLayout from '../components/ModelEditor/DesignEditorLayout';

// FormEditor: clean base editor using the ModelEditor layout in template mode
const FormEditor: React.FC = () => {
  return <ModelEditorLayout mode="template" />;
};

export default FormEditor;


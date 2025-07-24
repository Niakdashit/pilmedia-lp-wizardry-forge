import React from 'react';
import CanvaEditor from '../components/CanvaEditor/CanvaEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';

const CanvaEditorPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <CanvaEditor />
    </ErrorBoundary>
  );
};

export default CanvaEditorPage;
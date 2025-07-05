import React from 'react';
import ModernCampaignEditor from './ModernCampaignEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';

const ModernEditorPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ModernCampaignEditor />
    </ErrorBoundary>
  );
};

export default ModernEditorPage;
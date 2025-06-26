
import React from 'react';
import ModernCampaignEditor from './ModernCampaignEditor';
import ErrorBoundary from '../components/common/ErrorBoundary';

const ModernEditorPage: React.FC = () => {
  console.log('ModernEditorPage rendering');
  
  return (
    <ErrorBoundary>
      <ModernCampaignEditor />
    </ErrorBoundary>
  );
};

export default ModernEditorPage;

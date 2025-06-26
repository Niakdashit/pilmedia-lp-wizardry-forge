
import React from 'react';
import ModernCampaignEditor from './ModernCampaignEditor';

const ModernEditorPage: React.FC = () => {
  console.log('ModernEditorPage rendering');
  
  try {
    return (
      <ModernCampaignEditor />
    );
  } catch (error) {
    console.error('Error in ModernEditorPage:', error);
    return (
      <div className="w-full h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h1>
          <p className="text-red-500 mb-4">Une erreur s'est produite lors du chargement de l'éditeur.</p>
          <button 
            onClick={() => window.location.href = '/quick-campaign'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retour à QuickCampaign
          </button>
        </div>
      </div>
    );
  }
};

export default ModernEditorPage;

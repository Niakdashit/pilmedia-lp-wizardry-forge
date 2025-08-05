
import React from 'react';
import PageHeader from '../components/Layout/PageHeader';
import PageContainer from '../components/Layout/PageContainer';

const Contacts: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        size="sm"
      />
      
      <div className="px-6 space-y-6">
        {/* Contenu supprimé */}
      </div>
    </PageContainer>
  );
};

export default Contacts;

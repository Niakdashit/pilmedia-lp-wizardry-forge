
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import PageHeader from '../components/Layout/PageHeader';
import ClientInfoCard from '../components/Admin/AdminClientDetail/ClientInfoCard';
import ClientCampaignsTable from '../components/Admin/AdminClientDetail/ClientCampaignsTable';
import { ClientData, ClientCampaign } from '../components/Admin/AdminClientDetail/types';

const AdminClientDetail: React.FC = () => {
  const { clientId } = useParams();
  const [filterStatus, setFilterStatus] = useState('all');

  console.log('Client ID:', clientId); // Pour éviter l'erreur unused variable

  // Mock client data
  const clientData: ClientData = {
    id: 'client1',
    name: 'Jean Dupont',
    email: 'jean.dupont@techcorp.com',
    company: 'TechCorp Solutions',
    phone: '+33 1 23 45 67 89',
    address: '123 Rue de la Tech, 75001 Paris',
    website: 'https://techcorp-solutions.com',
    createdAt: '2024-01-15',
    lastActivity: '2025-01-10',
    status: 'active',
    notes: 'Client premium avec besoins spécifiques en gamification.'
  };

  // Mock campaigns data
  const campaigns: ClientCampaign[] = [
    {
      id: '1',
      name: 'Quiz Marketing Digital',
      description: 'Quiz pour évaluer les connaissances en marketing digital',
      status: 'active',
      type: 'quiz',
      participants: 342,
      views: 1250,
      conversionRate: 27.4,
      startDate: '2025-03-15',
      endDate: '2025-04-15',
      createdAt: '2025-03-10'
    },
    {
      id: '2',
      name: 'Roue de la Fortune',
      description: 'Jeu de roue pour les soldes d\'été',
      status: 'archived',
      type: 'wheel',
      participants: 856,
      views: 3200,
      conversionRate: 26.8,
      startDate: '2024-07-01',
      endDate: '2024-08-15',
      createdAt: '2024-06-20'
    },
    {
      id: '3',
      name: 'Quiz Produit',
      description: 'Quiz de connaissance de produits',
      status: 'draft',
      type: 'quiz',
      participants: 0,
      views: 0,
      conversionRate: 0,
      startDate: '2025-05-01',
      endDate: '2025-06-01',
      createdAt: '2025-04-15'
    }
  ];

  return (
    <div className="-mx-6 -mt-6 min-h-screen">
      <PageHeader
        title={`Client: ${clientData.company}`}
        size="sm"
        actions={
          <div className="flex gap-x-4">
            <Link to="/admin/clients">
              <Button
                variant="primary"
                className="px-4 sm:px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Retour Clients</span>
                <span className="sm:hidden">Retour</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div className="px-3 sm:px-6 pb-6 max-w-full overflow-hidden">
        <ClientInfoCard clientData={clientData} campaigns={campaigns} />
        <ClientCampaignsTable 
          campaigns={campaigns} 
          filterStatus={filterStatus} 
          setFilterStatus={setFilterStatus} 
        />
      </div>
    </div>
  );
};

export default AdminClientDetail;

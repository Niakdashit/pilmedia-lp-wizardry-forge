import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users } from 'lucide-react';
import PageHeader from '../components/Layout/PageHeader';
import AdminKPICards from '../components/Admin/AdminKPICards';
import AdminRecentActivity from '../components/Admin/AdminRecentActivity';
import AdminQuickAccess from '../components/Admin/AdminQuickAccess';
import AdminCampaignsTable from '../components/Admin/AdminCampaignsTable';
import { AdminStats, RecentActivity, AdminCampaign } from '../components/Admin/types';

const Admin: React.FC = () => {
  // Mock data - à remplacer par des vraies données Supabase
  const mockStats: AdminStats = {
    totalCampaigns: 247,
    activeCampaigns: 43,
    totalClients: 28,
    totalParticipations: 125430,
    avgConversionRate: 4.2,
    topGameType: 'Roue de la Fortune',
    topClient: 'TechCorp Solutions'
  };

  const mockRecentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'campaign_created',
      message: 'Nouvelle campagne "Quiz Marketing" créée',
      time: 'Il y a 2 minutes',
      campaignName: 'Quiz Marketing',
      clientName: 'TechCorp Solutions'
    },
    {
      id: '2',
      type: 'participation_spike',
      message: 'Pic de participation (+150%) sur "Roue Summer"',
      time: 'Il y a 15 minutes',
      campaignName: 'Roue Summer',
      clientName: 'Fashion Brand'
    },
    {
      id: '3',
      type: 'campaign_published',
      message: 'Campagne "Concours Photo" publiée',
      time: 'Il y a 1 heure',
      campaignName: 'Concours Photo',
      clientName: 'E-commerce Plus'
    },
    {
      id: '4',
      type: 'status_change',
      message: 'Campagne "Quiz Produit" archivée',
      time: 'Il y a 3 heures',
      campaignName: 'Quiz Produit',
      clientName: 'TechCorp Solutions'
    }
  ];

  const mockCampaigns: AdminCampaign[] = [
    {
      id: '1',
      name: 'Quiz Marketing Digital',
      description: 'Quiz pour évaluer les connaissances en marketing digital',
      clientName: 'TechCorp Solutions',
      clientId: 'client1',
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
      name: 'Concours Photo Été',
      description: 'Concours de photos estivales avec nos produits',
      clientName: 'Fashion Brand',
      clientId: 'client2',
      status: 'draft',
      type: 'quiz',
      participants: 0,
      views: 0,
      conversionRate: 0,
      startDate: '2025-06-01',
      endDate: '2025-07-15',
      createdAt: '2025-05-20'
    },
    {
      id: '3',
      name: 'Roue de la Fortune Soldes',
      description: 'Roue de la fortune pour gagner des réductions',
      clientName: 'E-commerce Plus',
      clientId: 'client3',
      status: 'archived',
      type: 'wheel',
      participants: 1256,
      views: 5430,
      conversionRate: 23.1,
      startDate: '2025-02-01',
      endDate: '2025-03-01',
      createdAt: '2025-01-15'
    }
  ];

  return (
    <div className="-mx-6 -mt-6 min-h-screen">
      <PageHeader
        title="Dashboard Administrateur"
        size="sm"
        actions={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/admin/templates"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm whitespace-nowrap"
            >
              <Target className="w-5 h-5 mr-2" />
              Modèles
            </Link>
            <Link
              to="/admin/clients"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white font-semibold rounded-xl hover:bg-[#6d164f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm whitespace-nowrap"
            >
              <Users className="w-5 h-5 mr-2" />
              Gestion Clients
            </Link>
          </div>
        }
      />

      <div className="px-6 pb-8 max-w-full overflow-hidden">
        <AdminKPICards stats={mockStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AdminRecentActivity activities={mockRecentActivity} />
          </div>
          <AdminQuickAccess />
        </div>

        <AdminCampaignsTable campaigns={mockCampaigns} />
      </div>
    </div>
  );
};

export default Admin;

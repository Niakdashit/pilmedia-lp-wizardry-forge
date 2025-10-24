import React, { useState } from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import UserManagement from '../components/Dashboard/UserManagement';
import PageContainer from '../components/Layout/PageContainer';
import { useProfile } from '../hooks/useProfile';
import { BarChart3, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'users'>('campaigns');

  const tabs = [
    { id: 'campaigns', label: 'Campagnes', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Ajouter l'onglet utilisateurs seulement pour les admins
  if (profile?.is_admin) {
    tabs.push({ id: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> });
  }

  return (
    <div className="min-h-screen">
      <PageContainer className="bg-transparent">
        <DashboardHeader />

        {/* Onglets de navigation */}
        <div className="px-6 sm:px-8 lg:px-10 pt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-[#841b60] text-[#841b60]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="px-6 sm:px-8 lg:px-10 py-6">
          {activeTab === 'campaigns' && (
            <div className="space-y-8">
              <RecentCampaigns />
            </div>
          )}

          {activeTab === 'users' && profile?.is_admin && (
            <div className="space-y-8">
              <UserManagement />
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
};
export default Dashboard;
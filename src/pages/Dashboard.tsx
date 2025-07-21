import React from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsGrid from '../components/Dashboard/StatsGrid';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  return (
    <PageContainer>
      <DashboardHeader />
      
      <div className="space-y-6 px-[25px] py-0">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Démarrer</h3>
          <div className="flex gap-4">
            <Link to="/login">
              <Button>
                Authentification
              </Button>
            </Link>
            <Link to="/c/test-campaign">
              <Button variant="outline">
                Voir campagne publique (test)
              </Button>
            </Link>
          </div>
        </div>
        
        <StatsGrid />
        <RecentCampaigns />
      </div>
    </PageContainer>
  );
};
export default Dashboard;
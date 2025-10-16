import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <PageContainer className="bg-transparent">
        <DashboardHeader />

        <div className="space-y-8 px-6 sm:px-8 lg:px-10 py-6">
          <RecentCampaigns />
        </div>
      </PageContainer>
    </div>
  );
};
export default Dashboard;
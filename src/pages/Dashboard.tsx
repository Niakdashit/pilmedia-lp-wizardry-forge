import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';

const Dashboard: React.FC = () => {
  return (
    <PageContainer className="bg-gray-50">
      <DashboardHeader />
      
      <div className="space-y-8 px-6 sm:px-8 lg:px-10 py-6">
        <RecentCampaigns />
      </div>
    </PageContainer>
  );
};
export default Dashboard;
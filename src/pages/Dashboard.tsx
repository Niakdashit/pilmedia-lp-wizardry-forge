import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import QuickCreationSection from '../components/Dashboard/QuickCreationSection';
import StatsGrid from '../components/Dashboard/StatsGrid';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';
const Dashboard: React.FC = () => {
  return <PageContainer>
      <DashboardHeader />
      
      <div className="space-y-6 px-[25px] py-0">
        <div className="mt-6">
          <QuickCreationSection />
        </div>
        <StatsGrid />
        <RecentCampaigns />
      </div>
    </PageContainer>;
};
export default Dashboard;
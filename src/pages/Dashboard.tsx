import React from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsGrid from '../components/Dashboard/StatsGrid';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';
import { Button } from '@/components/ui/button';
const Dashboard: React.FC = () => {
  return <PageContainer>
      <DashboardHeader />
      
      <div className="space-y-6 px-[25px] py-0">
        
        
        <StatsGrid />
        <RecentCampaigns />
      </div>
    </PageContainer>;
};
export default Dashboard;
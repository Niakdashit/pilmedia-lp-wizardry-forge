import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import QuickCreationSection from '../components/Dashboard/QuickCreationSection';
import StatsGrid from '../components/Dashboard/StatsGrid';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
const Dashboard: React.FC = () => {
  return <div className="-mx-6 -mt-6">
      <DashboardHeader />

      <div className="px-6 space-y-6 py-px">
        <QuickCreationSection />
        <StatsGrid />
        <RecentCampaigns />
      </div>
    </div>;
};
export default Dashboard;
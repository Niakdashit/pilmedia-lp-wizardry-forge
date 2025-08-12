import React from 'react';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsGrid from '../components/Dashboard/StatsGrid';
import RecentCampaigns from '../components/Dashboard/RecentCampaigns';
import PageContainer from '../components/Layout/PageContainer';

const Dashboard: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Tableau de bord | Prosplay';
    const desc = 'Tableau de bord Prosplay — statistiques et dernières campagnes.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + '/dashboard';
  }, []);

  return (
    <PageContainer>
      {/* Barre supérieure violette en arrière-plan */}
      <div aria-hidden className="fixed inset-x-0 top-0 h-14 bg-brand-primary -z-10" />

      {/* Fond pastel global débordant */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-6 -bottom-12 w-screen left-1/2 -translate-x-1/2 bg-gradient-to-b from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-transparent -z-10" />

        <header className="sr-only">
          <h1>Tableau de bord Prosplay</h1>
        </header>

        <DashboardHeader />
        <div className="space-y-6 px-[25px] py-0">
          <StatsGrid />
          <RecentCampaigns />
        </div>
      </div>
    </PageContainer>
  );
};
export default Dashboard;
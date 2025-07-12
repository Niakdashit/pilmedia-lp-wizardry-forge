
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import EditorOnlyLayout from './components/Layout/EditorOnlyLayout';
import Dashboard from './pages/Dashboard';
import CampaignEditor from './pages/CampaignEditor';
import Campaigns from './pages/Campaigns';
import Gamification from './pages/Gamification';
import ModernCampaignEditor from './pages/ModernCampaignEditor';
import ModernEditorPage from './pages/ModernEditorPage';
import ModernWizardPage from './pages/ModernWizardPage';
import QuickCampaign from './pages/QuickCampaign';
import Newsletter from './pages/Newsletter';
import Statistics from './pages/Statistics';
import Contacts from './pages/Contacts';
import Data from './pages/Data';
import Social from './pages/Social';
import Studies from './pages/Studies';
import Account from './pages/Account';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminClients from './pages/AdminClients';
import AdminClientDetail from './pages/AdminClientDetail';
import AdminTemplates from './pages/AdminTemplates';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminTeam from './pages/AdminTeam';
import AdminAlerts from './pages/AdminAlerts';
import QualifioEditor from './pages/QualifioEditor';

function App() {
  return (
    <AppProvider>
      <BrandThemeProvider>
        <Router>
          <Routes>
            {/* Routes principales avec sidebar de navigation */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="gamification" element={<Gamification />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="data" element={<Data />} />
              <Route path="social" element={<Social />} />
              <Route path="studies" element={<Studies />} />
              <Route path="account" element={<Account />} />
              <Route path="campaign-editor/:campaignId" element={<CampaignEditor />} />
            </Route>

            {/* Routes éditeur en plein écran sans sidebar principale */}
            <Route path="/quick-campaign" element={
              <EditorOnlyLayout title="Création rapide de campagne" backPath="/campaigns">
                <QuickCampaign />
              </EditorOnlyLayout>
            } />
            
            <Route path="/modern-campaign/:campaignId" element={
              <EditorOnlyLayout title="Éditeur moderne" backPath="/campaigns">
                <ModernCampaignEditor />
              </EditorOnlyLayout>
            } />
            
            <Route path="/modern-campaign/quick-preview" element={
              <EditorOnlyLayout title="Aperçu rapide" backPath="/quick-campaign">
                <ModernCampaignEditor />
              </EditorOnlyLayout>
            } />
            
            <Route path="/modern-editor/:campaignId" element={
              <EditorOnlyLayout title="Éditeur avancé" backPath="/campaigns">
                <ModernEditorPage />
              </EditorOnlyLayout>
            } />
            
            <Route path="/modern-wizard" element={
              <EditorOnlyLayout title="Assistant de création" backPath="/campaigns">
                <ModernWizardPage />
              </EditorOnlyLayout>
            } />
            
            <Route path="/qualifio-editor" element={<QualifioEditor />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="campaigns" element={<AdminCampaigns />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="clients/:clientId" element={<AdminClientDetail />} />
              <Route path="templates" element={<AdminTemplates />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="alerts" element={<AdminAlerts />} />
            </Route>
            
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;

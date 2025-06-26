
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Gamification from './pages/Gamification';
import Newsletter from './pages/Newsletter';
import Social from './pages/Social';
import Data from './pages/Data';
import Statistics from './pages/Statistics';
import Studies from './pages/Studies';
import Account from './pages/Account';
import Login from './pages/Login';
import Contacts from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import CampaignEditor from './pages/CampaignEditor';
import ModernWizardPage from './pages/ModernWizardPage';
import ModernEditorPage from './pages/ModernEditorPage';
import QuickCampaign from './pages/QuickCampaign';
import AdminLayout from './components/Admin/AdminLayout';
import Admin from './pages/Admin';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminClients from './pages/AdminClients';
import AdminClientDetail from './pages/AdminClientDetail';
import AdminTemplates from './pages/AdminTemplates';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminTeam from './pages/AdminTeam';
import AdminAlerts from './pages/AdminAlerts';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Main Application Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="gamification" element={<Gamification />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="social" element={<Social />} />
        <Route path="data" element={<Data />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="studies" element={<Studies />} />
        <Route path="account" element={<Account />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaigns/:id" element={<CampaignEditor />} />
      </Route>

      {/* Editor Routes (outside Layout) */}
      <Route path="/modern-wizard" element={<ModernWizardPage />} />
      <Route path="/modern-campaign/:id" element={<ModernEditorPage />} />
      <Route path="/quick-campaign" element={<QuickCampaign />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="clients/:id" element={<AdminClientDetail />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="alerts" element={<AdminAlerts />} />
      </Route>
    </Routes>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import EditorOnlyLayout from './components/Layout/EditorOnlyLayout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Gamification from './pages/Gamification';
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
import GameEditor from './pages/GameEditor';
import DesignEditor from './pages/DesignEditor';
import LivePreview from './pages/LivePreview';
import Auth from './pages/Auth';
import PublicCampaign from './pages/PublicCampaign';
import PageBeta from './pages/PageBeta';
import TestPage from './pages/TestPage';

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
              
            </Route>

            {/* Routes éditeur en plein écran sans sidebar principale */}
            <Route path="/quick-campaign" element={
              <EditorOnlyLayout title="Création rapide de campagne" backPath="/campaigns">
                <QuickCampaign />
              </EditorOnlyLayout>
            } />
            
            <Route path="/campaign-editor" element={<GameEditor />} />
            <Route path="/design-editor" element={<DesignEditor />} />
            <Route path="/live-preview" element={<LivePreview />} />
            
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/pagebeta" element={<PageBeta />} />
            <Route path="/testpage" element={<TestPage />} />
            <Route path="/c/:slug" element={<PublicCampaign />} />
          </Routes>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;

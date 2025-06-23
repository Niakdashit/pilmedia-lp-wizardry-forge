
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignEditor from './pages/CampaignEditor';
import QuickCampaign from './pages/QuickCampaign';
import Gamification from './pages/Gamification';
import Newsletter from './pages/Newsletter';
import Account from './pages/Account';
import Statistics from './pages/Statistics';
import Contacts from './pages/Contacts';
import Data from './pages/Data';
import Social from './pages/Social';
import Studies from './pages/Studies';
import ModernWizardPage from './pages/ModernWizardPage';
import Admin from './pages/Admin';
import AdminClients from './pages/AdminClients';
import AdminClientDetail from './pages/AdminClientDetail';
import AdminTemplates from './pages/AdminTemplates';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminTeam from './pages/AdminTeam';
import AdminAlerts from './pages/AdminAlerts';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import ModernEditorPage from './pages/ModernEditorPage';
import AdminLayout from './components/Admin/AdminLayout';
import Layout from './components/Layout/Layout';

const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login' || location.pathname === '/';
  const isModernCampaignRoute = location.pathname.startsWith('/modern-campaign');
  const isQuickCampaignRoute = location.pathname.startsWith('/quick-campaign');

  return (
    <AppProvider>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {isLoginRoute ? (
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        ) : isAdminRoute ? (
          <AdminLayout>
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/clients/:clientId" element={<AdminClientDetail />} />
              <Route path="/admin/templates" element={<AdminTemplates />} />
              <Route path="/admin/campaigns" element={<AdminCampaigns />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route path="/admin/alerts" element={<AdminAlerts />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
          </AdminLayout>
        ) : isModernCampaignRoute ? (
          <Routes>
            <Route path="/modern-campaign/:id" element={<ModernEditorPage />} />
          </Routes>
        ) : isQuickCampaignRoute ? (
          <Routes>
            <Route path="/quick-campaign" element={<QuickCampaign />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaign/:id" element={<CampaignEditor />} />
              <Route path="/modern-wizard" element={<ModernWizardPage />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/data" element={<Data />} />
              <Route path="/social" element={<Social />} />
              <Route path="/studies" element={<Studies />} />
              <Route path="/account" element={<Account />} />
              <Route path="/logout" element={<div className="p-6"><h1 className="text-2xl font-bold">Déconnexion</h1><p>Vous avez été déconnecté avec succès.</p></div>} />
            </Routes>
          </Layout>
        )}
      </div>
    </AppProvider>
  );
};

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import CampaignEditor from './pages/CampaignEditor';
import Gamification from './pages/Gamification';
import ModernCampaignEditor from './pages/ModernCampaignEditor';
import QuickCampaign from './pages/QuickCampaign';

function App() {
  return (
    <AppProvider>
      <BrandThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Gamification />} />
              <Route path="gamification" element={<Gamification />} />
              <Route path="campaign-editor/:campaignId" element={<CampaignEditor />} />
              <Route path="modern-campaign/:campaignId" element={<ModernCampaignEditor />} />
              <Route path="quick-campaign" element={<QuickCampaign />} />
            </Route>
          </Routes>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;

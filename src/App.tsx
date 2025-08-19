import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Gamification from './pages/Gamification';
import Statistics from './pages/Statistics';
import DesignEditor from './pages/DesignEditor';
import TemplateEditor from './pages/TemplateEditor';
import TemplatesEditor from './pages/TemplatesEditor';
import CampaignSettingsLayout from './pages/CampaignSettings/CampaignSettingsLayout';
import ChannelsStep from './pages/CampaignSettings/ChannelsStep';
import HomeStep from './pages/CampaignSettings/HomeStep';
import PrizesStep from './pages/CampaignSettings/PrizesStep';
import FormStep from './pages/CampaignSettings/FormStep';
import QualificationStep from './pages/CampaignSettings/QualificationStep';
import OutputStep from './pages/CampaignSettings/OutputStep';
import ParametersStep from './pages/CampaignSettings/ParametersStep';
import ViralityStep from './pages/CampaignSettings/ViralityStep';
import AppearanceStep from './pages/CampaignSettings/AppearanceStep';

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
              <Route path="statistics" element={<Statistics />} />
              <Route path="templates-editor" element={<TemplatesEditor />} />
            </Route>

            {/* Routes éditeur en plein écran */}
            <Route path="/design-editor" element={<DesignEditor />} />
            <Route path="/template-editor" element={<TemplateEditor />} />
            <Route path="/campaign/:id/settings/*" element={<CampaignSettingsLayout />}>
              <Route index element={<ChannelsStep />} />
              <Route path="home" element={<HomeStep />} />
              <Route path="prizes" element={<PrizesStep />} />
              <Route path="form" element={<FormStep />} />
              <Route path="qualification" element={<QualificationStep />} />
              <Route path="output" element={<OutputStep />} />
              <Route path="parameters" element={<ParametersStep />} />
              <Route path="virality" element={<ViralityStep />} />
              <Route path="appearance" element={<AppearanceStep />} />
            </Route>
          </Routes>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;




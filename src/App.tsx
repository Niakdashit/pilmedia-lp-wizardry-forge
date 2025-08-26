import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';

// Lazy-loaded pages to prevent import-time crashes from heavy modules at startup
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Statistics = lazy(() => import('./pages/Statistics'));
const DesignEditor = lazy(() => import('./pages/DesignEditor'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor'));
const TemplatesEditor = lazy(() => import('./pages/TemplatesEditor'));
const CampaignSettingsLayout = lazy(() => import('./pages/CampaignSettings/CampaignSettingsLayout'));
const ChannelsStep = lazy(() => import('./pages/CampaignSettings/ChannelsStep'));
const HomeStep = lazy(() => import('./pages/CampaignSettings/HomeStep'));
const PrizesStep = lazy(() => import('./pages/CampaignSettings/PrizesStep'));
const FormStep = lazy(() => import('./pages/CampaignSettings/FormStep'));
const QualificationStep = lazy(() => import('./pages/CampaignSettings/QualificationStep'));
const OutputStep = lazy(() => import('./pages/CampaignSettings/OutputStep'));
const ParametersStep = lazy(() => import('./pages/CampaignSettings/ParametersStep'));
const ViralityStep = lazy(() => import('./pages/CampaignSettings/ViralityStep'));
const AppearanceStep = lazy(() => import('./pages/CampaignSettings/AppearanceStep'));

function App() {
  // Idle prefetch heavy editor routes to smooth first navigation without impacting TTI
  useEffect(() => {
    const win: any = typeof window !== 'undefined' ? window : undefined;
    const schedule = (cb: () => void) =>
      win && typeof win.requestIdleCallback === 'function'
        ? win.requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 1500);
    const cancel = (id: any) =>
      win && typeof win.cancelIdleCallback === 'function' ? win.cancelIdleCallback(id) : clearTimeout(id);

    const id = schedule(() => {
      try {
        // These are already lazy; dynamic import here warms their chunks
        import('./pages/DesignEditor');
        import('./pages/TemplateEditor');
        import('./pages/TemplatesEditor');
      } catch (_) {
        // best-effort
      }
    });
    return () => cancel(id);
  }, []);
  return (
    <AppProvider>
      <BrandThemeProvider>
        <Router>
          <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
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
          </Suspense>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;




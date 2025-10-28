import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Lazy-loaded pages to prevent import-time crashes from heavy modules at startup
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Statistics = lazy(() => import('./pages/Statistics'));
const DesignEditor = lazy(() => import('./pages/DesignEditor'));
const QuizEditor = lazy(() => import('./pages/QuizEditor'));
const ModelEditor = lazy(() => import('./pages/ModelEditor'));
const JackpotEditor = lazy(() => import('./pages/JackpotEditor'));
const FormEditor = lazy(() => import('./pages/FormEditor'));
const ScratchCardEditor = lazy(() => import('./pages/ScratchCardEditor'));
const ScratchCard2 = lazy(() => import('./pages/ScratchCard2'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor'));
const TemplatesEditor = lazy(() => import('./pages/TemplatesEditor'));
const MobileTestPage = lazy(() => import('./pages/MobileTestPage'));
const MobileCompleteTestPage = lazy(() => import('./pages/MobileCompleteTestPage'));
const Templates = lazy(() => import('./pages/Templates'));
const Partnerships = lazy(() => import('./pages/Partnerships'));
const MediaDetail = lazy(() => import('./pages/MediaDetail'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const MediaPortal = lazy(() => import('./pages/MediaPortal'));
const CampaignSettings = lazy(() => import('./pages/CampaignSettings'));

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
        import('./pages/ModelEditor');
        import('./pages/FormEditor');
        import('./pages/ScratchCardEditor');
      } catch (_) {
        // best-effort
      }
    });
    return () => cancel(id);
  }, []);
  return (
    <AppProvider>
      <AuthProvider>
        <BrandThemeProvider>
          <Router>
            <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
              <Routes>
                {/* Route d'authentification */}
                <Route path="/auth" element={<Auth />} />

                {/* Routes principales avec sidebar de navigation */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="gamification" element={<Gamification />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="modeles" element={<Templates />} />
                  <Route path="templates-editor" element={<TemplatesEditor />} />
                  <Route path="partnerships" element={<Partnerships />} />
                  <Route path="partnerships/:id" element={<MediaDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="media" element={<MediaPortal />} />
                </Route>

              {/* Routes éditeur en plein écran */}
              <Route path="/design-editor" element={<DesignEditor />} />
              <Route path="/quiz-editor" element={<QuizEditor />} />
              <Route path="/model-editor" element={<ModelEditor />} />
              <Route path="/jackpot-editor" element={<JackpotEditor />} />
              <Route path="/form-editor" element={<FormEditor />} />
              <Route path="/scratch-editor" element={<ScratchCardEditor />} />
              <Route path="/scratch-card-2" element={<ScratchCard2 />} />
              <Route path="/template-editor" element={<TemplateEditor />} />
              <Route path="/mobile-test" element={<MobileTestPage />} />
              <Route path="/mobile-complete-test" element={<MobileCompleteTestPage />} />
              
              {/* Campaign Settings - Standalone page */}
              <Route path="/campaign/:id/settings" element={<CampaignSettings />} />
            </Routes>
          </Suspense>
        </Router>
      </BrandThemeProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;



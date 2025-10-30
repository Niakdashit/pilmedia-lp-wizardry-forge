import { lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { LoadingBoundary, EditorLoader, MinimalLoader } from './components/shared/LoadingBoundary';
import { routePrefetcher, ROUTE_LOADERS, ROUTE_NEIGHBORS } from './utils/routePrefetch';

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
  // Enregistrement des routes pour le prefetching intelligent
  useEffect(() => {
    // Enregistrer toutes les routes dans le prefetcher
    Object.entries(ROUTE_LOADERS).forEach(([route, loader]) => {
      const priority = route.includes('editor') ? 'medium' : 'low';
      routePrefetcher.register(route, loader, { priority });
    });

    // Nettoyer le localStorage des anciennes données (> 7 jours)
    if (typeof window !== 'undefined') {
      import('./utils/compressedStorage').then(({ compressedStorage }) => {
        compressedStorage.cleanOldEntries();
      });
    }
  }, []);

  // Détecter la route actuelle et précharger les voisins
  useEffect(() => {
    const currentPath = window.location.pathname;
    const neighbors = ROUTE_NEIGHBORS[currentPath];
    if (neighbors) {
      routePrefetcher.prefetchNeighbors(currentPath, neighbors);
    }
  }, []);
  return (
    <AppProvider>
      <AuthProvider>
        <BrandThemeProvider>
          <Router>
            <LoadingBoundary fallback={<MinimalLoader />}>
              <Routes>
                {/* Route d'authentification */}
                <Route path="/auth" element={
                  <LoadingBoundary minHeight="100vh">
                    <Auth />
                  </LoadingBoundary>
                } />

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
              <Route path="/design-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <DesignEditor />
                </LoadingBoundary>
              } />
              <Route path="/quiz-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <QuizEditor />
                </LoadingBoundary>
              } />
              <Route path="/model-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <ModelEditor />
                </LoadingBoundary>
              } />
              <Route path="/jackpot-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <JackpotEditor />
                </LoadingBoundary>
              } />
              <Route path="/form-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <FormEditor />
                </LoadingBoundary>
              } />
              <Route path="/scratch-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <ScratchCardEditor />
                </LoadingBoundary>
              } />
              <Route path="/scratch-card-2" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <ScratchCard2 />
                </LoadingBoundary>
              } />
              <Route path="/template-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <TemplateEditor />
                </LoadingBoundary>
              } />
              <Route path="/mobile-test" element={<MobileTestPage />} />
              <Route path="/mobile-complete-test" element={<MobileCompleteTestPage />} />

              {/* Campaign Settings - Standalone page */}
              <Route path="/campaign/:id/settings" element={
                <LoadingBoundary>
                  <CampaignSettings />
                </LoadingBoundary>
              } />
              </Routes>
            </LoadingBoundary>
          </Router>
        </BrandThemeProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;



import { lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { LoadingBoundary, EditorLoader, MinimalLoader } from './components/shared/LoadingBoundary';
import DebugConsoleFloatButton from './components/DebugConsoleFloatButton';
import { routePrefetcher, ROUTE_LOADERS, ROUTE_NEIGHBORS } from './utils/routePrefetch';
import CampaignStatisticsFull from './pages/CampaignStatisticsFull';
import { CookieBanner } from './components/GDPR/CookieBanner';
import { GDPRSettings } from './components/GDPR/GDPRSettings';

// Lazy-loaded pages to prevent import-time crashes from heavy modules at startup
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Gamification = lazy(() => import('./pages/Gamification'));
const Statistics = lazy(() => import('./pages/Statistics'));
const DesignEditor = lazy(() => import('./pages/DesignEditor'));
const QuizEditor = lazy(() => import('./pages/QuizEditor'));
const ReferenceEditor = lazy(() => import('./pages/ReferenceEditor'));
const WebEditor = lazy(() => import('./pages/WebEditor'));
const SwiperEditor = lazy(() => import('./pages/SwiperEditor'));
const JackpotEditor = lazy(() => import('./pages/JackpotEditor'));
const FormEditor = lazy(() => import('./pages/FormEditor'));
const ScratchCardEditor = lazy(() => import('./pages/ScratchCardEditor'));
const DesignEditorPlus = lazy(() => import('./pages/DesignEditorPlus'));
const QuizEditorPlus = lazy(() => import('./pages/QuizEditorPlus'));
const ScratchEditorPlus = lazy(() => import('./pages/ScratchEditorPlus'));
const JackpotEditorPlus = lazy(() => import('./pages/JackpotEditorPlus'));
const TemplateEditor = lazy(() => import('./pages/TemplateEditor'));
const TemplatesEditor = lazy(() => import('./pages/TemplatesEditor'));
const MobileTestPage = lazy(() => import('./pages/MobileTestPage'));
const MobileCompleteTestPage = lazy(() => import('./pages/MobileCompleteTestPage'));
const Templates = lazy(() => import('./pages/Templates'));
const Partnerships = lazy(() => import('./pages/Partnerships'));
const MediaDetail = lazy(() => import('./pages/MediaDetailNew'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const MediaPortal = lazy(() => import('./pages/MediaPortal'));
const CampaignSettings = lazy(() => import('./pages/CampaignSettings'));
// Import direct sans lazy loading pour debug
// const CampaignStatistics = lazy(() => import('./pages/CampaignStatisticsMinimal'));
const OEmbed = lazy(() => import('./pages/OEmbed'));
const IntegrationsTest = lazy(() => import('./pages/IntegrationsTest'));
const ShortUrlRedirect = lazy(() => import('./pages/ShortUrlRedirect'));
const DebugConsoleErrorPage = lazy(() => import('./pages/DebugConsoleErrorPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));

// Import direct (non lazy) pour la page publique - pas de spinner
import PublicCampaignPage from './pages/PublicCampaign';
const FullscreenPreview = lazy(() => import('./pages/FullscreenPreview'));

function App() {
  const [showGDPRSettings, setShowGDPRSettings] = useState(false);

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
              <DebugConsoleFloatButton />
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
                  {/* Campaign Statistics */}
                  <Route path="campaign/:id/statistics" element={<CampaignStatisticsFull />} />
                  <Route path="stats/:id" element={<CampaignStatisticsFull />} />
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
              <Route path="/reference-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <ReferenceEditor />
                </LoadingBoundary>
              } />
              <Route path="/web-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <WebEditor />
                </LoadingBoundary>
              } />
              <Route path="/swiper-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <SwiperEditor />
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
              <Route path="/template-editor" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <TemplateEditor />
                </LoadingBoundary>
              } />
              <Route path="/mobile-test" element={<MobileTestPage />} />
              <Route path="/mobile-complete-test" element={<MobileCompleteTestPage />} />

              {/* Advanced Editors - Accessible via "Mécaniques avancées" modal */}
              <Route path="/advanced-wheel" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <DesignEditorPlus />
                </LoadingBoundary>
              } />
              <Route path="/advanced-quiz" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <QuizEditorPlus />
                </LoadingBoundary>
              } />
              <Route path="/advanced-scratch" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <ScratchEditorPlus />
                </LoadingBoundary>
              } />
              <Route path="/advanced-jackpot" element={
                <LoadingBoundary fallback={<EditorLoader />}>
                  <JackpotEditorPlus />
                </LoadingBoundary>
              } />

              {/* Campaign Settings - Standalone page */}
              <Route path="/campaign/:id/settings" element={
                <LoadingBoundary>
                  <CampaignSettings />
                </LoadingBoundary>
              } />
              {/* Public campaign view - No spinner, direct load */}
              <Route path="/campaign/:id" element={<PublicCampaignPage />} />
              
              {/* Fullscreen Preview - Aperçu plein écran avec device switcher */}
              <Route 
                path="/fullscreen-preview/:id" 
                element={
                  <LoadingBoundary>
                    <FullscreenPreview />
                  </LoadingBoundary>
                } 
              />
              {/* oEmbed endpoint */}
              <Route path="/oembed" element={
                <LoadingBoundary>
                  <OEmbed />
                </LoadingBoundary>
              } />
              {/* Integrations test page */}
              <Route path="/integrations-test" element={
                <LoadingBoundary>
                  <IntegrationsTest />
                </LoadingBoundary>
              } />
              {/* Short URL redirect */}
              <Route path="/s/:code" element={
                <LoadingBoundary>
                  <ShortUrlRedirect />
                </LoadingBoundary>
              } />

              {/* Debug console error page */}
              <Route path="/debug-console-error" element={
                <LoadingBoundary>
                  <DebugConsoleErrorPage />
                </LoadingBoundary>
              } />

              {/* Legal pages */}
              <Route path="/privacy" element={
                <LoadingBoundary>
                  <PrivacyPolicy />
                </LoadingBoundary>
              } />
              <Route path="/terms" element={
                <LoadingBoundary>
                  <TermsOfService />
                </LoadingBoundary>
              } />
              <Route path="/legal" element={
                <LoadingBoundary>
                  <LegalNotice />
                </LoadingBoundary>
              } />
              </Routes>
            </LoadingBoundary>

            {/* GDPR Cookie Banner */}
            <CookieBanner onSettingsClick={() => setShowGDPRSettings(true)} />
            
            {/* GDPR Settings Modal */}
            {showGDPRSettings && (
              <GDPRSettings onClose={() => setShowGDPRSettings(false)} />
            )}
          </Router>
        </BrandThemeProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import CampaignEditor from './pages/CampaignEditor';
import Gamification from './pages/Gamification';
import ModernCampaignEditor from './pages/ModernCampaignEditor';
import QuickCampaign from './pages/QuickCampaign';
import { CampaignProvider } from './context/CampaignContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import WheelDemo from './pages/WheelDemo';
import ScratchCardDemo from './pages/ScratchCardDemo';
import DiceDemo from './pages/DiceDemo';
import QuizDemo from './pages/QuizDemo';
import JackpotDemo from './pages/JackpotDemo';
import MemoryDemo from './pages/MemoryDemo';
import NotFound from './pages/NotFound';
import PublicCampaignView from './pages/PublicCampaignView';

function App() {
  return (
    <AppContext>
      <BrandThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/campaign/:campaignId" element={<PublicCampaignView />} />

              <Route path="/" element={<PrivateRoute><Gamification /></PrivateRoute>} />
              <Route path="/gamification" element={<PrivateRoute><Gamification /></PrivateRoute>} />
              
              <Route path="/campaign-editor/:campaignId" element={<PrivateRoute>
                <CampaignProvider><CampaignEditor /></CampaignProvider>
              </PrivateRoute>} />
              
              <Route path="/modern-campaign/:campaignId" element={<PrivateRoute>
                <CampaignProvider><ModernCampaignEditor /></CampaignProvider>
              </PrivateRoute>} />

              <Route path="/quick-campaign" element={<PrivateRoute><QuickCampaign /></PrivateRoute>} />

              <Route path="/wheel-demo" element={<WheelDemo />} />
              <Route path="/scratch-card-demo" element={<ScratchCardDemo />} />
              <Route path="/dice-demo" element={<DiceDemo />} />
              <Route path="/quiz-demo" element={<QuizDemo />} />
              <Route path="/jackpot-demo" element={<JackpotDemo />} />
              <Route path="/memory-demo" element={<MemoryDemo />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </BrandThemeProvider>
    </AppContext>
  );
}

export default App;

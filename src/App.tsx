
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BrandThemeProvider } from './contexts/BrandThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Gamification from './pages/Gamification';
import Statistics from './pages/Statistics';
import GameEditor from './pages/GameEditor';
import DesignEditor from './pages/DesignEditor';
import ModernEditorPage from './pages/ModernEditorPage';


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
            </Route>

            {/* Routes éditeur en plein écran */}
            <Route path="/campaign-editor" element={<GameEditor />} />
            <Route path="/design-editor" element={<DesignEditor />} />
            <Route path="/modern-editor" element={<ModernEditorPage />} />
          </Routes>
        </Router>
      </BrandThemeProvider>
    </AppProvider>
  );
}

export default App;

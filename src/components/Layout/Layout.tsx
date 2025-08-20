import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAppContext } from '../../context/AppContext';
import { Menu, User, LogOut, PieChart, HelpCircle, LayoutGrid, FileText, DollarSign, Brain, Puzzle, ClipboardList } from 'lucide-react';
const headerLogo = '/logos/prosplay-header-logo.svg';

const Layout: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();
  

  const handleLogout = () => {
    // TODO: Implémenter la logique de déconnexion
    console.log('Déconnexion');
    // Exemple de redirection après déconnexion
    // navigate('/login');
  };

  const handleAccount = () => {
    // TODO: Implémenter la navigation vers le compte
    console.log('Accéder au compte');
    // Exemple de redirection vers le compte
    // navigate('/mon-compte');
  };

  // Empêche le scroll du background seulement quand la sidebar est ouverte sur mobile
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      document.body.classList.toggle('overflow-hidden', isMobile && !sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  // Écouter les changements de taille d'écran pour réajuster le scroll
  useEffect(() => {
    const handleResize = () => {
      if (typeof document !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('overflow-hidden', isMobile && !sidebarCollapsed);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] w-full relative" style={{ overflow: 'hidden' }}>
      {/* Bande dégradée circulaire - Nouveau Header */}
      <div 
        className="fixed top-0 left-0 right-0 h-[5cm]"
        style={{
          background: 'radial-gradient(circle at 0% 0%, #b41b60, #841b60 70%)',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          overflow: 'hidden',
          padding: '2px 32px 24px',
          zIndex: 1,
          boxShadow: '0 14px 34px rgba(0, 0, 0, 0.67)'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Icônes compte (top-right) */}
          <div className="absolute flex items-center gap-3 right-6 top-4">
            <button 
              onClick={handleAccount}
              className="text-white/90 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Mon compte"
            >
              <User className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="text-white/90 hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Contenu principal */}
          <div className="h-full w-full flex flex-col items-center justify-center px-2 sm:px-6">
            {/* Bande translucide titre */}
            <div className="w-full max-w-4xl rounded-2xl border border-white/30 shadow-[0_6px_24px_rgba(0,0,0,0.25)] px-4 sm:px-8 py-3 sm:py-4 mb-4"
                 style={{
                   background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 100%)',
                   backdropFilter: 'blur(6px)'
                 }}
            >
              <h1 className="text-center text-white font-semibold text-lg sm:text-2xl">
                Qu'allez-vous créer aujourd'hui ?
              </h1>
            </div>

            {/* Panneau foncé avec actions */}
            <div className="relative w-full max-w-5xl rounded-2xl border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.35)] px-3 sm:px-8 py-5"
                 style={{ background: '#4e1641' }}
            >
              {/* motifs décoratifs courbes */}
              <div className="pointer-events-none absolute -left-28 -bottom-28 w-64 h-64 rounded-full"
                   style={{ background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%)' }}
              />
              <div className="pointer-events-none absolute -right-28 -top-28 w-64 h-64 rounded-full"
                   style={{ background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%)' }}
              />

              {/* Ligne d'actions */}
              <div className="relative grid grid-cols-4 sm:flex sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-6">
                {[
                  { label: 'Roue de la fortune', Icon: PieChart },
                  { label: 'Quiz', Icon: HelpCircle },
                  { label: 'Catalogue', Icon: LayoutGrid },
                  { label: 'Devis', Icon: FileText },
                  { label: 'Jackpot', Icon: DollarSign },
                  { label: 'Memory', Icon: Brain },
                  { label: 'Puzzle', Icon: Puzzle },
                  { label: 'Formulaire', Icon: ClipboardList },
                ].map(({ label, Icon }) => (
                  <button key={label}
                          className="group inline-flex flex-col items-center gap-2 focus:outline-none"
                          title={label}
                  >
                    <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[#7b1f61] shadow-md shadow-black/30 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/70 group-hover:text-white/90 transition-colors leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carré rouge avec border-radius - Contenu principal */}
      <div 
        className="fixed z-20"
        style={{
          borderRadius: '28px 28px 0 0',
          margin: '0',
          top: '1.16cm', /* Augmenté de 15% supplémentaire par rapport à 1.37cm */
          bottom: '0',
          left: '0',
          right: '0',
          boxSizing: 'border-box',
          backgroundColor: '#f3f4f6',
        }}
      />
      
      {/* Layout principal avec sidebar et contenu */}
      <div className="relative z-30 w-full flex flex-1" style={{ 
        marginTop: '1.16cm',
        height: 'calc(100vh - 1.16cm)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <Sidebar />
        
        {/* Overlay mobile/tablette pour cliquer et fermer la sidebar */}
        <div 
          onClick={toggleSidebar} 
          className={`md:hidden fixed inset-0 bg-black/30 transition-opacity z-30 ${
            sidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 max-w-full relative">
          <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
            <button onClick={toggleSidebar} className="text-gray-500">
              <Menu className="w-6 h-6" />
            </button>
            <img src={headerLogo} alt="Prosplay Logo" className="h-8 w-auto" />
          </header>
          <main className="flex-1 overflow-y-auto w-full py-0 px-0">
            <div className="w-full max-w-full py-0 sm:py-6 px-4 sm:px-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

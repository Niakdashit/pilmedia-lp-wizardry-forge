import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAppContext } from '../../context/AppContext';
import { Menu, User, LogOut } from 'lucide-react';
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
    <div className="flex min-h-screen bg-[#eaf5f6] w-full relative" style={{ overflow: 'hidden' }}>
      {/* Bande dégradée circulaire - Header avec Logo */}
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
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <img 
            src={headerLogo} 
            alt="Prosplay Logo" 
            style={{
              height: '93px',
              width: 'auto',
              filter: 'brightness(0) invert(1)',
              maxWidth: '468px',
              marginTop: '-120px',
              marginLeft: '1.5%',
              padding: 0
            }} 
          />
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            marginTop: '-122px',
            marginRight: '24px'
          }}>
            <button 
              onClick={handleAccount}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Mon compte"
              style={{
                borderRadius: '50%',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              title="Déconnexion"
              style={{
                borderRadius: '50%',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          backgroundColor: '#eaf5f6',
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

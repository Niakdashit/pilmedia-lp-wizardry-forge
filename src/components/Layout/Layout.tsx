
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAppContext } from '../../context/AppContext';
import { Menu } from 'lucide-react';
const logo = '/prosplay-logo.svg';

const Layout: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

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
    <div className="relative min-h-screen overflow-hidden w-full">
      {/* Fond pastel global avec léger débordement */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[calc(100%+4rem)] bg-gradient-to-br from-[#fdf1f5] to-[#fde8ef] -z-10" />
      {/* Bande violette supérieure */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%+4rem)] h-40 bg-[radial-gradient(circle_at_0%_0%,_#841b60,_#b41b60)] rounded-b-[28px] shadow-md -z-0" />

      <div className="relative flex min-h-screen overflow-hidden w-full">
        <Sidebar />
        {/* Overlay mobile/tablette pour cliquer et fermer la sidebar */}
        <div
          onClick={toggleSidebar}
          className={`md:hidden fixed inset-0 bg-black/30 transition-opacity z-30 ${
            sidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        />
        <div className="flex-1 flex flex-col min-w-0 max-w-full z-10">
          <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
            <button onClick={toggleSidebar} className="text-gray-500">
              <Menu className="w-6 h-6" />
            </button>
            <img src={logo} alt="Prosplay Logo" className="h-8 w-auto" />
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


import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAppContext } from '../../context/AppContext';
import { Menu } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminLayout: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  // Empêche le scroll du background seulement quand la sidebar est ouverte sur mobile
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      document.body.classList.toggle('overflow-hidden', isMobile && !sidebarCollapsed);
    }
  }, [sidebarCollapsed]);

  // Écouter les changements de taille d'écran
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
    <div className="flex min-h-screen bg-[#ebf4f7] overflow-hidden w-full">
      <AdminSidebar />
      {/* Overlay mobile/tablette pour cliquer et fermer la sidebar */}
      <div 
        onClick={toggleSidebar} 
        className={`md:hidden fixed inset-0 bg-black/30 transition-opacity z-30 ${
          sidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`} 
      />
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
          <button onClick={toggleSidebar} className="text-gray-500">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Leadya Logo" className="h-8 w-auto" />
            <span className="text-red-600 font-bold text-sm">ADMIN</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-3 sm:p-6 w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

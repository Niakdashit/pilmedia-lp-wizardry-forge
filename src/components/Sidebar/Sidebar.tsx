
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Gamepad2,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
const sidebarLogo = '/logos/prosplay-sidebar-logo.svg';
const logoIcon = '/prosplay-icon.svg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  // Prefetch map for lazy routes defined in App.tsx
  const routePrefetchers: Record<string, () => Promise<any>> = {
    '/dashboard': () => import('../../pages/Dashboard'),
    '/campaigns': () => import('../../pages/Campaigns'),
    '/gamification': () => import('../../pages/Gamification'),
    '/statistics': () => import('../../pages/Statistics'),
    // '/templates-editor': () => import('../../pages/TemplatesEditor'), // Add if linked in sidebar later
  };

  const prefetchRoute = (path: string) => {
    const loader = routePrefetchers[path];
    if (loader) {
      try { loader(); } catch (_) { /* best-effort */ }
    }
  };

  const navItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Campagnes', path: '/campaigns', icon: <Target className="w-5 h-5" /> },
    { name: 'Gamification', path: '/gamification', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'Statistiques', path: '/statistics', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200/50 transform md:transform-none transition-transform duration-300 ease-in-out ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 md:w-64'} w-64`}
      style={{ borderTopLeftRadius: '28px' }}
    >
      {/* Logo section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
        {!sidebarCollapsed ? (
          <img src={sidebarLogo} alt="Prosplay Logo" className="h-24 w-auto mx-auto mt-2" style={{maxWidth: '220px'}} />
        ) : (
          <div className="w-full flex items-center justify-center">
            <img src={logoIcon} alt="Prosplay Icon" className="h-12 w-12 object-contain" style={{maxWidth: '48px'}} />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#841b60] focus:outline-none transition-colors duration-200"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => prefetchRoute(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white' : 'text-gray-600 hover:bg-[#f8f0f5] hover:text-[#841b60]'}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white group-hover:bg-white'}`}>{item.icon}</div>
                {!sidebarCollapsed && <span className="ml-3 font-medium truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
};

export default Sidebar;

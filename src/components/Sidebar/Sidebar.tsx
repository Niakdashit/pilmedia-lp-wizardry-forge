
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Gamepad2, BarChart3, Handshake, Shield, Globe } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
const logoIcon = '/prosplay-icon.svg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  // Sidebar is permanently collapsed (no toggle)

  // Prefetch map for lazy routes defined in App.tsx
  const routePrefetchers: Record<string, () => Promise<any>> = {
    '/dashboard': () => import('../../pages/Dashboard'),
    '/campaigns': () => import('../../pages/Campaigns'),
    '/gamification': () => import('../../pages/Gamification'),
    '/statistics': () => import('../../pages/Statistics'),
    '/partnerships': () => import('../../pages/Partnerships'),
    '/admin': () => import('../../pages/Admin'),
    '/media': () => import('../../pages/MediaPortal'),
    // '/templates-editor': () => import('../../pages/TemplatesEditor'), // Add if linked in sidebar later
  };

  const prefetchRoute = (path: string) => {
    const loader = routePrefetchers[path];
    if (loader) {
      try { loader(); } catch (_) { /* best-effort */ }
    }
  };

  const baseNavItems = [
    { name: 'Accueil', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Campagnes', path: '/campaigns', icon: <Target className="w-5 h-5" /> },
    { name: 'Gamification', path: '/gamification', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'Partenariats', path: '/partnerships', icon: <Handshake className="w-5 h-5" /> },
    { name: 'Stats', path: '/statistics', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  // Construire navItems avec Médias et Admin selon les rôles
  const navItems = [...baseNavItems];
  
  // Ajouter Médias pour admin et media
  if (profile?.is_admin || profile?.is_media) {
    navItems.push({ name: 'Médias', path: '/media', icon: <Globe className="w-5 h-5" /> });
  }
  
  // Ajouter Admin seulement pour admin
  if (profile?.is_admin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Shield className="w-5 h-5" /> });
  }

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#2c2c34] border-r border-gray-700/50 transform md:transform-none transition-transform duration-300 ease-in-out -translate-x-full md:translate-x-0 md:w-20 w-64`}
      style={{ borderTopLeftRadius: '18px' }}
    >
      {/* Logo section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-600/30">
        <button
          onClick={() => {
            if (location.pathname !== '/dashboard') {
              prefetchRoute('/dashboard');
              navigate('/dashboard');
            }
          }}
          className="w-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
          title="Retour au dashboard"
        >
          <img src={logoIcon} alt="Prosplay Icon" className="h-9 w-9 object-contain brightness-0 invert" style={{maxWidth: '36px'}} />
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-2 py-4">
        <div className="grid grid-cols-1 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => prefetchRoute(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={`flex flex-col items-center px-2 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-gray-600/30 text-gray-300 group-hover:bg-gray-600/50 group-hover:text-white'}`}>{item.icon}</div>
                <span className="mt-1 text-[10px] font-medium text-center truncate w-full">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
};

export default Sidebar;

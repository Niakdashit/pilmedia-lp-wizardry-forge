
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Gamepad2,
  Mail,
  BarChart3,
  Users,
  Database,
  Share2,
  BookOpen,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
const logo = '/prosplay-logo.svg';
const logoIcon = '/prosplay-icon.svg';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  const navItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Campagnes', path: '/campaigns', icon: <Target className="w-5 h-5" /> },
    { name: 'Gamification', path: '/gamification', icon: <Gamepad2 className="w-5 h-5" /> },
    { name: 'Newsletter', path: '/newsletter', icon: <Mail className="w-5 h-5" /> },
    { name: 'Statistiques', path: '/statistics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Contacts', path: '/contacts', icon: <Users className="w-5 h-5" /> },
    { name: 'Données', path: '/data', icon: <Database className="w-5 h-5" /> },
    { name: 'Réseaux sociaux', path: '/social', icon: <Share2 className="w-5 h-5" /> },
    { name: 'Études', path: '/studies', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Compte', path: '/account', icon: <UserCircle className="w-5 h-5" /> }
  ];

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200/50 transform md:transform-none transition-transform duration-300 ease-in-out ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 md:w-64'} w-64`}
    >
      {/* Logo section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
        {!sidebarCollapsed ? (
          <img src={logo} alt="Prosplay Logo" className="h-24 w-auto mx-auto mt-2" style={{maxWidth: '220px'}} />
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
                className={`flex items-center px-3 py-2 rounded transition-all duration-200 group ${isActive ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white' : 'text-gray-600 hover:bg-[#f8f0f5] hover:text-[#841b60]'}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded ${isActive ? 'bg-white/20' : 'bg-white group-hover:bg-white'}`}>{item.icon}</div>
                {!sidebarCollapsed && <span className="ml-3 font-medium truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer section */}
      <div className="p-3 border-t border-gray-200/50">
        <Link
          to="/admin"
          className="flex items-center px-3 py-2 rounded text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group mb-2"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white group-hover:bg-white">
            <Shield className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Interface Admin</span>}
        </Link>
        
        <Link
          to="/login"
          className="flex items-center px-3 py-2 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white group-hover:bg-white">
            <LogOut className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Déconnexion</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;


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
import logo from '@/assets/logo.png';
import logoIcon from '@/assets/logo2.png';

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
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col transform transition-all duration-300 ease-in-out shadow-glass ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 md:w-64'} w-64 bg-gradient-to-b from-brand to-brand-dark text-white`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/20">
        {!sidebarCollapsed ? (
          <img src={logo} alt="Leadya Logo" className="h-11 w-auto ml-14 mt-2" />
        ) : (
          <div className="w-full flex items-center justify-center">
            <img src={logoIcon} alt="Leadya Icon" className="h-8 w-8 object-contain" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white focus:outline-none transition-colors duration-200"
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
                className={`flex items-center px-3 py-2 rounded-xl transition-all duration-200 group ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    isActive ? 'bg-white/30' : 'bg-white/10 group-hover:bg-white/20'
                  }`}
                >
                  {item.icon}
                </div>
                {!sidebarCollapsed && <span className="ml-3 font-medium truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer section */}
      <div className="p-3 border-t border-white/20">
        <Link
          to="/admin"
          className="flex items-center px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 group mb-2"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20">
            <Shield className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Interface Admin</span>}
        </Link>

        <Link
          to="/login"
          className="flex items-center px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20">
            <LogOut className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Déconnexion</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

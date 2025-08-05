
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Target,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  FileText
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import logo from '@/assets/logo.png';
import logoIcon from '@/assets/logo2.png';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppContext();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Campagnes', path: '/admin/campaigns', icon: <Target className="w-5 h-5" /> },
    { name: 'Clients', path: '/admin/clients', icon: <Users className="w-5 h-5" /> },
    { name: 'Modèles de Jeux', path: '/admin/templates', icon: <Zap className="w-5 h-5" /> },
    { name: 'Analytiques', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Équipe & Rôles', path: '/admin/team', icon: <Shield className="w-5 h-5" /> },
    { name: 'Alertes & Automatisation', path: '/admin/alerts', icon: <Bell className="w-5 h-5" /> },
    { name: 'Rapports', path: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Paramètres', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200/50 transform md:transform-none transition-transform duration-300 ease-in-out ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 md:w-64'} w-64`}
    >
      {/* Logo section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
        {!sidebarCollapsed ? (
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Prosplay Logo" className="h-8 w-auto" />
            <span className="text-red-600 font-bold text-sm">ADMIN</span>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <img src={logoIcon} alt="Prosplay Icon" className="h-8 w-8 object-contain" />
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
            const isActive = location.pathname === item.path || 
              (item.path === '/admin' && location.pathname === '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white' : 'text-gray-600 hover:bg-[#f8f0f5] hover:text-[#841b60]'}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white group-hover:bg-white'}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && <span className="ml-3 font-medium truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer section */}
      <div className="p-3 border-t border-gray-200/50">
        <Link
          to="/dashboard"
          className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group mb-2"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white group-hover:bg-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Interface Client</span>}
        </Link>
        
        <Link
          to="/login"
          className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white group-hover:bg-white">
            <LogOut className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && <span className="ml-3 font-medium">Déconnexion</span>}
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;

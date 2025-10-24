import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { User, LogOut } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
const headerLogo = '/logos/prosplay-header-logo.svg';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth');
    }
  };

  const handleAccount = () => {
    navigate('/profile');
  };

  // Sidebar is permanently collapsed; no body scroll lock is needed

  return (
    <div
      className="flex min-h-screen w-full relative"
      style={{
        overflow: 'hidden',
        backgroundImage:
          'radial-gradient(130% 130% at 12% 20%, rgba(235, 155, 100, 0.8) 0%, rgba(235, 155, 100, 0) 55%), radial-gradient(120% 120% at 78% 18%, rgba(128, 82, 180, 0.85) 0%, rgba(128, 82, 180, 0) 60%), radial-gradient(150% 150% at 55% 82%, rgba(68, 52, 128, 0.75) 0%, rgba(68, 52, 128, 0) 65%), linear-gradient(90deg, #E07A3A 0%, #9A5CA9 50%, #3D2E72 100%)',
        backgroundBlendMode: 'screen, screen, lighten, normal',
        backgroundColor: '#3D2E72',
      }}
    >
      <header
        className="absolute z-40 flex items-center justify-between px-7"
        style={{
          left: '9px',
          right: '9px',
          top: 'calc(1.16cm - 56px)',
          height: '72px'
        }}
      >
        <img 
          src={headerLogo} 
          alt="Prosplay Logo" 
          style={{
            height: '72px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            maxWidth: '468px'
          }} 
        />
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleAccount}
            className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
            title="Mon compte"
          >
            <User className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      
      {/* Carré rouge avec border-radius - Contenu principal */}
      <div 
        className="fixed z-20"
        style={{
          borderRadius: '28px',
          margin: '0',
          top: '1.16cm', /* Augmenté de 15% supplémentaire par rapport à 1.37cm */
          bottom: '9px',
          left: '9px',
          right: '9px',
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
        }}
      />
      
      {/* Layout principal avec sidebar et contenu */}
      <div className="relative z-30 w-full flex flex-1" style={{ 
        marginTop: '1.16cm',
        height: 'calc(100vh - 1.16cm - 9px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRadius: '28px',
        overflow: 'hidden',
        marginLeft: '9px',
        marginRight: '9px'
      }}>
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0 max-w-full relative">
          {/* Sidebar is locked closed; no mobile toggle header */}
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

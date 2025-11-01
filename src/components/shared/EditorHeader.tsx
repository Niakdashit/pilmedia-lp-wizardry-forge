import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from '@/lib/router-adapter';

const headerLogo = '/logos/prosplay-header-logo.svg';

const EditorHeader: React.FC = () => {
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

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header
      className="absolute z-40 items-center justify-between px-7 hidden lg:flex"
      style={{
        left: '9px',
        right: '9px',
        top: 'calc(1.16cm - 56px)',
        height: '72px',
      }}
    >
      <button
        onClick={handleGoToDashboard}
        className="cursor-pointer transition-opacity hover:opacity-80"
        title="Retour au dashboard"
      >
        <img
          src={headerLogo}
          alt="Prosplay Logo"
          style={{
            height: '72px',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            maxWidth: '468px',
          }}
        />
      </button>
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
  );
};

export default EditorHeader;

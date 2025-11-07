import React from 'react';
import { User, LogOut, Archive } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from '@/lib/router-adapter';
import { useSearchParams } from 'react-router-dom';

const headerLogo = '/logos/prosplay-header-logo.svg';

const EditorHeader: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuthContext();
  
  // Get campaign ID from URL and check if it's valid (not temporary)
  const campaignId = searchParams.get('campaign');
  const isValidCampaignId = campaignId && 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId) &&
    !campaignId.startsWith('temp-');

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
  
  const handleBackups = () => {
    if (campaignId) {
      navigate(`/campaign/${campaignId}/backups`);
    }
  };

  return (
    <header
      className="absolute z-[60] flex items-center justify-between px-7"
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
        {isValidCampaignId && (
          <button
            onClick={handleBackups}
            className="text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200"
            title="Gérer les sauvegardes"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
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

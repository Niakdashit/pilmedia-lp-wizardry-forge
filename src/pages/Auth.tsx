import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../components/Auth/AuthModal';
import { useAuthContext } from '../contexts/AuthContext';
import Spinner from '../components/shared/Spinner';

const Auth: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Rediriger automatiquement si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 Utilisateur déjà connecté, redirection vers le dashboard');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ 
          margin: 0,
          background: 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))',
          minHeight: '100vh'
        }}
      >
        <Spinner size="lg" text="Vérification de la connexion..." className="text-white" />
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne rien afficher (il sera redirigé)
  if (user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4" 
        style={{ 
          margin: 0,
          background: 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))',
          minHeight: '100vh'
        }}
      >
        <Spinner size="lg" text="Redirection en cours..." className="text-white" />
      </div>
    );
  }

  const handleClose = () => {
    setIsModalOpen(false);
    // Si on ferme sans être connecté, rester sur la page d'auth
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        margin: 0,
        background: 'linear-gradient(180deg, rgba(59, 56, 135, 0.855), rgba(156, 26, 96, 0.72), rgba(195, 85, 70, 0.775), rgba(156, 26, 96, 0.72))',
        minHeight: '100vh'
      }}
    >
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logos/prosplay-header-logo.svg"
            alt="Prosplay Logo"
            className="h-16 mx-auto mb-4 filter brightness-0 invert"
          />
          <h1 className="text-4xl font-bold text-white mb-2">Prosplay</h1>
          <p className="text-white/80">Plateforme de marketing digital</p>
        </div>

        <AuthModal
          isOpen={isModalOpen}
          onClose={handleClose}
          initialMode="login"
        />
      </div>
    </div>
  );
};

export default Auth;

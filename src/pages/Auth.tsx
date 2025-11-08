import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '../components/Auth/AuthModal';
import { useAuthContext } from '../contexts/AuthContext';

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
      <>
        <style>{`
          body {
            background: linear-gradient(
              180deg,
              #943c56,
              #370e4b
            );
            height: 100vh;
            margin: 0;
          }
        `}</style>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ height: '100vh', margin: 0 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Vérification de la connexion...</p>
          </div>
        </div>
      </>
    );
  }

  // Si l'utilisateur est connecté, ne rien afficher (il sera redirigé)
  if (user) {
    return (
      <>
        <style>{`
          body {
            background: linear-gradient(
              180deg,
              #943c56,
              #370e4b
            );
            height: 100vh;
            margin: 0;
          }
        `}</style>
        <div className="min-h-screen flex items-center justify-center p-4" style={{ height: '100vh', margin: 0 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Redirection en cours...</p>
          </div>
        </div>
      </>
    );
  }

  const handleClose = () => {
    setIsModalOpen(false);
    // Si on ferme sans être connecté, rester sur la page d'auth
  };

  return (
    <>
      <style>{`
        body {
          background: linear-gradient(
            180deg,
            #943c56,
            #370e4b
          );
          height: 100vh;
          margin: 0;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ height: '100vh', margin: 0 }}>
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
    </>
  );
};

export default Auth;

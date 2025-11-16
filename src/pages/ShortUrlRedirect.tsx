import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/shared/Spinner';

// Minimal short URL helpers (placeholder)
const getShortUrlMapping = (code: string) => ({ longUrl: `/c/${code}` });
const incrementShortUrlClicks = async (_code: string) => {};

/**
 * Page de redirection pour les Short URLs
 * Route: /s/:code
 */
const ShortUrlRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }

    // Récupérer le mapping
    const mapping = getShortUrlMapping(code);

    if (!mapping) {
      // Short URL non trouvée
      navigate('/404');
      return;
    }

    // Incrémenter le compteur de clics
    incrementShortUrlClicks(code);

    // Rediriger vers l'URL longue
    // Petit délai pour permettre l'enregistrement du clic
    setTimeout(() => {
      window.location.href = mapping.longUrl;
    }, 100);
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
          Redirection en cours...
        </h2>
        <p className="text-gray-600">
          Vous allez être redirigé vers votre destination
        </p>
      </div>
    </div>
  );
};

export default ShortUrlRedirect;

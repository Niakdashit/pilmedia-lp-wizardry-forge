import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShortUrlMapping, incrementShortUrlClicks } from '@/utils/shortUrl';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
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

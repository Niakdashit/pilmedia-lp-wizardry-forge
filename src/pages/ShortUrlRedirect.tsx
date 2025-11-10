import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    // TODO: Implémenter la logique de redirection
    console.log('Redirection code:', code);
    navigate('/');
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto" />
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

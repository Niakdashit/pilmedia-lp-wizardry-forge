import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { 
  createShortUrl, 
  validateCustomCode, 
  saveShortUrlMapping, 
  getShortUrlMapping,
  type ShortUrlMapping 
} from '@/utils/shortUrl';

interface ShortUrlGeneratorProps {
  longUrl: string;
  campaignId: string;
  onShortUrlCreated?: (shortUrl: string, code: string) => void;
}

export const ShortUrlGenerator: React.FC<ShortUrlGeneratorProps> = ({
  longUrl,
  campaignId,
  onShortUrlCreated
}) => {
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingMapping, setExistingMapping] = useState<ShortUrlMapping | null>(null);

  // Charger le mapping existant si disponible
  useEffect(() => {
    if (campaignId) {
      // Chercher si une short URL existe déjà pour cette campagne
      const stored = localStorage.getItem('prosplay_short_urls');
      if (stored) {
        const mappings: ShortUrlMapping[] = JSON.parse(stored);
        const existing = mappings.find(m => m.campaignId === campaignId);
        if (existing) {
          setExistingMapping(existing);
          setShortUrl(`${window.location.origin}/s/${existing.code}`);
        }
      }
    }
  }, [campaignId]);

  const generateShortUrl = (useCustomCode: boolean = false) => {
    setLoading(true);
    setError('');

    try {
      let code = '';

      if (useCustomCode && customCode) {
        // Valider le code personnalisé
        const validation = validateCustomCode(customCode);
        if (!validation.valid) {
          setError(validation.error || 'Code invalide');
          setLoading(false);
          return;
        }

        // Vérifier si le code existe déjà
        const existing = getShortUrlMapping(customCode);
        if (existing && existing.campaignId !== campaignId) {
          setError('Ce code est déjà utilisé');
          setLoading(false);
          return;
        }

        code = customCode;
      }

      // Créer la short URL
      const newShortUrl = createShortUrl(longUrl, code || undefined);
      const shortCode = newShortUrl.split('/s/')[1];

      // Sauvegarder le mapping
      const mapping: ShortUrlMapping = {
        code: shortCode,
        longUrl,
        campaignId,
        createdAt: new Date().toISOString(),
        clicks: 0
      };

      saveShortUrlMapping(mapping);
      setShortUrl(newShortUrl);
      setExistingMapping(mapping);

      if (onShortUrlCreated) {
        onShortUrlCreated(newShortUrl, shortCode);
      }
    } catch (err) {
      setError('Erreur lors de la génération de la short URL');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerate = () => {
    setShortUrl('');
    setCustomCode('');
    setError('');
    setExistingMapping(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Short URL</h3>
        {existingMapping && (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        )}
      </div>

      {!shortUrl ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code personnalisé (optionnel)
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
                  {window.location.origin}/s/
                </span>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => {
                    setCustomCode(e.target.value);
                    setError('');
                  }}
                  placeholder="mon-code"
                  className="flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lettres, chiffres, tirets et underscores uniquement (3-20 caractères)
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => generateShortUrl(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Générer automatiquement
                </>
              )}
            </button>
            {customCode && (
              <button
                onClick={() => generateShortUrl(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Utiliser ce code
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Short URL générée</p>
                <p className="text-sm font-mono text-gray-900 truncate">{shortUrl}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copier"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Ouvrir"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {existingMapping && existingMapping.clicks !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>
                <strong>{existingMapping.clicks}</strong> clic{existingMapping.clicks > 1 ? 's' : ''}
              </span>
              {existingMapping.lastClickedAt && (
                <span className="text-gray-500">
                  • Dernier: {new Date(existingMapping.lastClickedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          )}

          <button
            onClick={regenerate}
            className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Régénérer une nouvelle URL
          </button>
        </div>
      )}
    </div>
  );
};

export default ShortUrlGenerator;

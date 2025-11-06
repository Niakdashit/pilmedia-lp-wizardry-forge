import React, { useState } from 'react';
import { Link2, QrCode, Download, Share2 } from 'lucide-react';
import ShortUrlGenerator from './ShortUrlGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import { generateQRCodeUrl, downloadQRCode } from '@/utils/qrCode';

interface ShortUrlQRCodeProps {
  longUrl: string;
  campaignId: string;
  campaignName?: string;
}

export const ShortUrlQRCode: React.FC<ShortUrlQRCodeProps> = ({
  longUrl,
  campaignId,
  campaignName = 'Campagne'
}) => {
  const [shortUrl, setShortUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'short' | 'qr' | 'both'>('both');

  const handleShortUrlCreated = (url: string, code: string) => {
    setShortUrl(url);
  };

  const downloadCombined = async () => {
    // Télécharger un QR code de la short URL si elle existe, sinon de l'URL longue
    const urlToEncode = shortUrl || longUrl;
    const qrUrl = generateQRCodeUrl(urlToEncode, { size: 1000, errorCorrection: 'H' });
    
    try {
      await downloadQRCode(qrUrl, `${campaignId}-qrcode-shorturl`);
    } catch (error) {
      console.error('Error downloading combined QR code:', error);
    }
  };

  const shareUrl = async () => {
    const urlToShare = shortUrl || longUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaignName,
          text: `Découvrez cette campagne: ${campaignName}`,
          url: urlToShare,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copier dans le presse-papier
      try {
        await navigator.clipboard.writeText(urlToShare);
        alert('URL copiée dans le presse-papier!');
      } catch (error) {
        console.error('Error copying:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 text-lg">Partage & Promotion</h2>
        <div className="flex gap-2">
          <button
            onClick={shareUrl}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {(shortUrl || longUrl) && (
            <button
              onClick={downloadCombined}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger QR Code"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('both')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'both'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Link2 className="w-4 h-4" />
            <QrCode className="w-4 h-4" />
            <span>Tout</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('short')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'short'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Link2 className="w-4 h-4" />
            <span>Short URL</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'qr'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {(activeTab === 'both' || activeTab === 'short') && (
          <ShortUrlGenerator
            longUrl={longUrl}
            campaignId={campaignId}
            onShortUrlCreated={handleShortUrlCreated}
          />
        )}

        {(activeTab === 'both' || activeTab === 'qr') && (
          <div className="space-y-3">
            {/* QR Code pour URL longue */}
            <QRCodeGenerator
              data={longUrl}
              campaignId={campaignId}
              title="QR Code - URL Complète"
              defaultColor="0F172A"
            />

            {/* QR Code pour Short URL si elle existe */}
            {shortUrl && (
              <div className="relative">
                <div className="absolute -top-2 left-4 z-10">
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                    Recommandé
                  </span>
                </div>
                <QRCodeGenerator
                  data={shortUrl}
                  campaignId={`${campaignId}-short`}
                  title="QR Code - Short URL"
                  defaultColor="16A34A"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Astuce:</strong> Utilisez la Short URL avec le QR Code pour un meilleur tracking et une URL plus facile à partager.
        </p>
      </div>

      {/* Stats Preview */}
      {shortUrl && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Avantages de la Short URL</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              URL plus courte et mémorisable
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              QR Code plus simple et lisible
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Tracking des clics intégré
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Partage facilité sur réseaux sociaux
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShortUrlQRCode;

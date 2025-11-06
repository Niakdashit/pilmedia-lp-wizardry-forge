import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check, Palette, RefreshCw } from 'lucide-react';
import { 
  generateQRCodeUrl, 
  generateBrandedQRCode,
  downloadQRCode,
  type QRCodeOptions 
} from '@/utils/qrCode';

interface QRCodeGeneratorProps {
  data: string;
  campaignId: string;
  title?: string;
  defaultColor?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  campaignId,
  title = 'QR Code',
  defaultColor = '0F172A'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [color, setColor] = useState(defaultColor);
  const [size, setSize] = useState<number>(300);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [copied, setCopied] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  // Générer le QR Code
  useEffect(() => {
    if (data) {
      const url = generateBrandedQRCode(data, color, {
        size,
        errorCorrection
      });
      setQrCodeUrl(url);
    }
  }, [data, color, size, errorCorrection]);

  const handleDownload = async (format: 'small' | 'medium' | 'large' | 'print') => {
    const sizes = {
      small: 300,
      medium: 600,
      large: 1000,
      print: 2000
    };

    const downloadUrl = generateBrandedQRCode(data, color, {
      size: sizes[format],
      errorCorrection: 'H' // Haute qualité pour téléchargement
    });

    try {
      await downloadQRCode(downloadUrl, `qrcode-${campaignId}-${format}`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const copyQRCodeUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const presetColors = [
    { name: 'Noir', value: '000000' },
    { name: 'Bleu', value: '2563EB' },
    { name: 'Vert', value: '16A34A' },
    { name: 'Rouge', value: 'DC2626' },
    { name: 'Violet', value: '9333EA' },
    { name: 'Orange', value: 'EA580C' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => setShowCustomization(!showCustomization)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Personnaliser"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* QR Code Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-3 flex items-center justify-center">
        {qrCodeUrl ? (
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="max-w-full h-auto"
            style={{ width: Math.min(size, 300) }}
          />
        ) : (
          <div className="text-gray-400 text-center py-8">
            <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune donnée à encoder</p>
          </div>
        )}
      </div>

      {/* Customization Panel */}
      {showCustomization && (
        <div className="space-y-3 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {presetColors.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setColor(preset.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === preset.value 
                      ? 'border-blue-500 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: `#${preset.value}` }}
                  title={preset.name}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={`#${color}`}
                  onChange={(e) => setColor(e.target.value.replace('#', ''))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                  title="Couleur personnalisée"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille: {size}px
            </label>
            <input
              type="range"
              min="150"
              max="600"
              step="50"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correction d'erreur
            </label>
            <select
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Faible (7%)</option>
              <option value="M">Moyenne (15%)</option>
              <option value="Q">Élevée (25%)</option>
              <option value="H">Très élevée (30%)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Plus la correction est élevée, plus le QR code peut être endommagé tout en restant lisible
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {qrCodeUrl && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDownload('medium')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            <button
              onClick={copyQRCodeUrl}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copié!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier URL
                </>
              )}
            </button>
          </div>

          {/* Download Sizes */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900 py-2">
              Autres formats de téléchargement
            </summary>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleDownload('small')}
                className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
              >
                Petit (300px)
              </button>
              <button
                onClick={() => handleDownload('large')}
                className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs"
              >
                Grand (1000px)
              </button>
              <button
                onClick={() => handleDownload('print')}
                className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs col-span-2"
              >
                Impression (2000px)
              </button>
            </div>
          </details>
        </div>
      )}

      {/* Data Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Données encodées:</strong>
        </p>
        <p className="text-xs text-gray-700 font-mono mt-1 break-all bg-gray-50 p-2 rounded">
          {data.length > 50 ? `${data.substring(0, 50)}...` : data}
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

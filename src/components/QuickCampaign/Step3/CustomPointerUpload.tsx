
import React, { useRef } from 'react';
import { Upload, MousePointer, X, Image } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const CustomPointerUpload: React.FC = () => {
  const { customPointer, setCustomPointer } = useQuickCampaignStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPointer({
        enabled: true,
        file,
        url,
        type: 'custom'
      });
    }
  };

  const handleRemoveCustomPointer = () => {
    if (customPointer.url) {
      URL.revokeObjectURL(customPointer.url);
    }
    setCustomPointer({
      enabled: false,
      file: null,
      url: null,
      type: 'default'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MousePointer className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Pointeur personnalisé</h3>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Utiliser un pointeur personnalisé</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={customPointer.enabled}
              onChange={(e) => setCustomPointer({ enabled: e.target.checked })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {customPointer.enabled && (
          <div className="space-y-4">
            {customPointer.url ? (
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={customPointer.url}
                      alt="Pointeur personnalisé"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pointeur personnalisé</p>
                    <p className="text-xs text-gray-500">
                      {customPointer.file?.name || 'Image téléchargée'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCustomPointer}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Télécharger un pointeur personnalisé
                </p>
                <p className="text-xs text-gray-400">
                  PNG, SVG recommandés • Max 2MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Image className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Conseils pour un pointeur optimal :</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Utilisez un fichier SVG pour une qualité parfaite</li>
                    <li>Orientez la pointe vers le bas</li>
                    <li>Taille recommandée : 50x50px minimum</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPointerUpload;

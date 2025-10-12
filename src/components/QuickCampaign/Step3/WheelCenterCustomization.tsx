
import React, { useRef } from 'react';
import { Target, Upload, X, Image } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const WheelCenterCustomization: React.FC = () => {
  const { wheelCenter, setWheelCenter } = useQuickCampaignStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setWheelCenter({
        enabled: true,
        file,
        url,
        type: 'image'
      });
    }
  };

  const handleRemoveCenter = () => {
    if (wheelCenter.url) {
      URL.revokeObjectURL(wheelCenter.url);
    }
    setWheelCenter({
      enabled: false,
      file: null,
      url: null,
      type: 'logo'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Centre de la roue</h3>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Personnaliser le centre</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={wheelCenter.enabled}
              onChange={(e) => setWheelCenter({ enabled: e.target.checked })}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {wheelCenter.enabled && (
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'élément
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setWheelCenter({ type: 'logo' })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    wheelCenter.type === 'logo'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Logo
                </button>
                <button
                  onClick={() => setWheelCenter({ type: 'image' })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    wheelCenter.type === 'image'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setWheelCenter({ type: 'animation' })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    wheelCenter.type === 'animation'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Animation
                </button>
              </div>
            </div>

            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Taille: <span className="text-purple-600 font-semibold">{wheelCenter.size}px</span>
              </label>
              <input
                type="range"
                min="40"
                max="120"
                value={wheelCenter.size}
                onChange={(e) => setWheelCenter({ size: parseInt(e.target.value) })}
                className="w-full h-2 bg-gradient-to-r from-purple-200 to-purple-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Petit</span>
                <span>Grand</span>
              </div>
            </div>

            {/* File Upload */}
            {wheelCenter.type !== 'logo' && (
              <div>
                {wheelCenter.url ? (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={wheelCenter.url}
                          alt="Centre personnalisé"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Élément personnalisé</p>
                        <p className="text-xs text-gray-500">
                          {wheelCenter.file?.name || 'Fichier téléchargé'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCenter}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Télécharger un {wheelCenter.type === 'image' ? 'image' : 'animation'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {wheelCenter.type === 'animation' ? 'GIF, WEBP animé' : 'PNG, JPG, SVG'} • Max 2MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={wheelCenter.type === 'animation' ? '.gif,.webp' : 'image/*,.svg'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Image className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="text-xs text-purple-700">
                  <p className="font-medium mb-1">Conseils :</p>
                  <ul className="space-y-1 list-disc list-inside ml-2">
                    <li>Format carré recommandé pour un rendu optimal</li>
                    <li>Logo : utilise automatiquement votre logo de marque</li>
                    <li>Animation : formats GIF ou WEBP animé supportés</li>
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

export default WheelCenterCustomization;

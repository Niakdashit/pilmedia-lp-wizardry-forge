
import React from 'react';
import { Sparkles, Eye, Zap, Palette } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const WheelRenderingEffects: React.FC = () => {
  const { wheelCustomization, setWheelCustomization } = useQuickCampaignStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Eye className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-900">Effets de rendu avancés</h3>
      </div>

      {/* Texture Effects */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-cyan-600" />
          <h4 className="font-medium text-gray-900">Textures et matériaux</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setWheelCustomization({ texture: 'metallic' })}
            className={`p-3 text-sm rounded-lg border transition-all ${
              wheelCustomization.texture === 'metallic'
                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="w-full h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded mb-2"></div>
            Métallique
          </button>
          
          <button
            onClick={() => setWheelCustomization({ texture: 'glass' })}
            className={`p-3 text-sm rounded-lg border transition-all ${
              wheelCustomization.texture === 'glass'
                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="w-full h-8 bg-gradient-to-r from-blue-200 to-blue-400 opacity-70 rounded mb-2"></div>
            Verre
          </button>
          
          <button
            onClick={() => setWheelCustomization({ texture: 'neon' })}
            className={`p-3 text-sm rounded-lg border transition-all ${
              wheelCustomization.texture === 'neon'
                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="w-full h-8 bg-gradient-to-r from-pink-400 to-purple-600 rounded mb-2 shadow-lg shadow-pink-200"></div>
            Néon
          </button>
          
          <button
            onClick={() => setWheelCustomization({ texture: 'wood' })}
            className={`p-3 text-sm rounded-lg border transition-all ${
              wheelCustomization.texture === 'wood'
                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="w-full h-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded mb-2"></div>
            Bois
          </button>
        </div>
      </div>

      {/* Animation Effects */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-600" />
          <h4 className="font-medium text-gray-900">Animations dynamiques</h4>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">Pulsation des segments</span>
            </div>
            <input
              type="checkbox"
              checked={wheelCustomization.pulseAnimation || false}
              onChange={(e) => setWheelCustomization({ pulseAnimation: e.target.checked })}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-600 rounded-full animate-bounce"></div>
              <span className="text-sm text-gray-700">Particules magiques</span>
            </div>
            <input
              type="checkbox"
              checked={wheelCustomization.particleEffect || false}
              onChange={(e) => setWheelCustomization({ particleEffect: e.target.checked })}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700">Rotation continue</span>
            </div>
            <input
              type="checkbox"
              checked={wheelCustomization.continuousRotation || false}
              onChange={(e) => setWheelCustomization({ continuousRotation: e.target.checked })}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* 3D Effects */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h4 className="font-medium text-gray-900">Effets 3D professionnels</h4>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Profondeur 3D: <span className="text-purple-600 font-semibold">{wheelCustomization.depth3D || 0}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={wheelCustomization.depth3D || 0}
            onChange={(e) => setWheelCustomization({ depth3D: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-purple-200 to-purple-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Perspective: <span className="text-purple-600 font-semibold">{wheelCustomization.perspective || 0}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="45"
            value={wheelCustomization.perspective || 0}
            onChange={(e) => setWheelCustomization({ perspective: parseInt(e.target.value) })}
            className="w-full h-2 bg-gradient-to-r from-purple-200 to-purple-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg p-4 border border-cyan-200">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-600 mt-0.5" />
          <div className="text-xs text-cyan-700">
            <p className="font-medium mb-1">Effets premium :</p>
            <ul className="space-y-1 list-disc list-inside ml-2">
              <li>Rendu haute définition avec anti-aliasing</li>
              <li>Effets de particules en temps réel</li>
              <li>Textures procédurales dynamiques</li>
              <li>Support des ombres volumétriques</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelRenderingEffects;

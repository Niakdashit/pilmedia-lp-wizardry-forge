import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import Mode2Preview from '../components/GameEditor/Preview/Mode2Preview';
import type { DeviceType, EditorConfig } from '../components/GameEditor/GameEditorLayout';

const FinalPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceType>('desktop');
  
  // Récupérer la configuration depuis les paramètres URL
  const configParam = searchParams.get('config');
  const config: EditorConfig = configParam ? JSON.parse(decodeURIComponent(configParam)) : null;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuration manquante</h1>
          <p className="text-gray-600 mb-6">Impossible de charger l'aperçu sans configuration.</p>
          <button 
            onClick={() => navigate('/design-editor')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retour à l'éditeur
          </button>
        </div>
      </div>
    );
  }

  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice);
  };

  const getDeviceClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] h-[667px] mx-auto';
      case 'tablet':
        return 'w-[768px] h-[1024px] mx-auto';
      default:
        return 'w-full h-full';
    }
  };

  const renderPreview = () => {
    // Créer une configuration complète avec des valeurs par défaut pour la roue
    const fullConfig = {
      ...config,
      gameType: 'wheel' as const,
      wheelSegments: [
        { label: 'Prix 1', color: '#FF6B6B' },
        { label: 'Prix 2', color: '#4ECDC4' },
        { label: 'Prix 3', color: '#45B7D1' },
        { label: 'Prix 4', color: '#96CEB4' },
        { label: 'Prix 5', color: '#FFEAA7' },
        { label: 'Prix 6', color: '#DDA0DD' }
      ],
      wheelSize: 300,
      wheelTheme: 'classic',
      participateButtonColor: config.participateButtonColor || '#841b60',
      backgroundColor: config.backgroundColor || '#10b981',
      outlineColor: config.outlineColor || '#dc2626'
    } as EditorConfig;

    const commonProps = {
      device,
      config: fullConfig,
      onTextUpdate: () => {}, // Lecture seule
      onTextDelete: () => {}, // Lecture seule
      onImageUpdate: () => {}, // Lecture seule
      onImageDelete: () => {}, // Lecture seule
    };

    // Debug log pour voir la config
    console.log('FinalPreview config:', fullConfig);

    // Toujours utiliser Mode2Preview pour le Design Editor
    return <Mode2Preview {...commonProps} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec contrôles */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Aperçu Final - {config.campaignName || 'Campagne'}
          </h1>
          
          {/* Sélecteur d'appareil */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleDeviceChange('desktop')}
              className={`p-2 rounded-md transition-all duration-200 ${
                device === 'desktop' ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-200'
              }`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeviceChange('tablet')}
              className={`p-2 rounded-md transition-all duration-200 ${
                device === 'tablet' ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-200'
              }`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeviceChange('mobile')}
              className={`p-2 rounded-md transition-all duration-200 ${
                device === 'mobile' ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-200'
              }`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fermer l'aperçu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Zone d'aperçu */}
      <div className="flex-1 p-6">
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className={`${getDeviceClass()} ${
              device !== 'desktop' ? 'border border-gray-300 rounded-lg shadow-lg overflow-hidden' : ''
            }`}
            style={{ 
              minHeight: device === 'desktop' ? 'calc(100vh - 120px)' : undefined,
              backgroundColor: '#ffffff'
            }}
          >
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalPreview;
import React, { useState } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import QualifioSidebar from './QualifioSidebar';
import QualifioPreview from './QualifioPreview';
import DeviceSelector from './DeviceSelector';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface EditorConfig {
  // General
  width: number;
  height: number;
  anchor: 'fixed' | 'center';
  
  // Banner
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  backgroundColor?: string;
  outlineColor?: string;
  
  // Text
  titleText?: string;
  titleSize?: number;
  titleColor?: string;
  titleFont?: string;
  contentText?: string;
  contentSize?: number;
  contentColor?: string;
  contentFont?: string;
  
  // Layout
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
  
  // Footer
  footerImage?: string;
  footerDescription?: string;
  footerLink?: string;
  
  // Colors
  graphicsColor?: string;
}

const QualifioEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [config, setConfig] = useState<EditorConfig>({
    width: 810,
    height: 1200,
    anchor: 'fixed',
    titleText: 'GRAND JEU\nLECTURES DE L\'ÉTÉ',
    titleSize: 42,
    titleColor: '#000000',
    titleFont: 'Raleway',
    contentText: 'Découvrez une nouvelle façon de colorier mélant mystère et détente avec ces 50 illustrations inédites ! Animaux, paysages, fleurs, fées... chaque image est découpée en zones. Il suffit de colorier les zones dotées d\'un symbole (croix, cercle, triangle ou carré) pour faire apparaître le dessin. Vous pouvez choisir de colorier toutes les zones munies d\'un symbole de la même couleur pour obtenir un résultat uni, ou vous pouvez attribuer une couleur différente à chaque symbole pour créer des camaïeux de couleurs ou des versions multicolores de vos dessins.\n\nDétendez-vous et laissez libre cours à votre créativité !',
    contentSize: 16,
    contentColor: '#000000',
    contentFont: 'Raleway',
    bannerLink: 'www.hachettheroes.com',
    centerText: false,
    centerForm: true,
    centerGameZone: true,
    backgroundColor: '#ffffff',
    outlineColor: '#ffffff'
  });

  const updateConfig = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/gamification"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Éditeur Qualifio</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <DeviceSelector 
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Sauvegarder le template
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Sauvegarder & quitter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <QualifioSidebar 
          config={config}
          onConfigUpdate={updateConfig}
        />
        
        {/* Preview Area */}
        <div className="flex-1 p-6">
          <QualifioPreview 
            device={selectedDevice}
            config={config}
          />
        </div>
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
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
  
  // Game modes
  gameMode: 'mode1-sequential' | 'mode2-background';
  displayMode: 'mode1-banner-game' | 'mode2-background';
  
  // Banner
  bannerImage?: string;
  bannerDescription?: string;
  bannerLink?: string;
  backgroundColor?: string;
  outlineColor?: string;
  
  // Text content
  storyText?: string;
  publisherLink?: string;
  prizeText?: string;
  
  // Layout
  centerText?: boolean;
  centerForm?: boolean;
  centerGameZone?: boolean;
}

const QualifioEditorLayout: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [config, setConfig] = useState<EditorConfig>({
    width: 810,
    height: 1200,
    anchor: 'fixed',
    gameMode: 'mode1-sequential',
    displayMode: 'mode1-banner-game',
    storyText: `Valentine et son frère aîné, Antoine, ont 13 ans d'écart. Orphelins de mère, ils viennent de perdre leur père, César Mestre. Le jour des obsèques, une inconnue leur remet une lettre de leur père. La lettre n'explicite pas grand-chose, mais évoque une fracture, des réparations qui n'ont pas eu le temps d'être faites. Antoine s'en détourne vite et retourne à sa vie rangée avec sa femme et ses enfants. Mais Valentine ne reconnaît pas dans ces lignes l'enfance qu'elle a vécue et se donne pour mission de comprendre ce que leur père a voulu leur dire et va enquêter. À son récit s'enchâsse celui de Laure, factrice à Loisel, un petit village normand, et qui vient de faire la connaissance de César. Elle s'est réfugiée là quatre ans plus tôt, après une dépression, et laissant la garde de son fils à son ex-mari, fils avec lequel elle tente peu à peu de renouer un lien fort. Le destin des deux femmes va se croiser.`,
    publisherLink: 'editions.flammarion.com',
    prizeText: 'Jouez et tentez de remporter l\'un des 10 exemplaires de "Les notes invisibles" d\'une valeur unitaire de 21 euros !',
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
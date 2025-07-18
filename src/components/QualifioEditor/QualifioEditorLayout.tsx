import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Palette, Settings, FileText, Code, ImageIcon, RotateCcw, MousePointer } from 'lucide-react';
import { DeviceSelector } from './Controls/DeviceSelector';
import { Sidebar } from './Sidebar/Sidebar';
import { Preview } from './Preview/Preview';

export interface BrandAssets {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
}

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  textColor?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface DeviceConfig {
  desktop?: {
    gamePosition?: { x: number; y: number; scale: number };
  };
  tablet?: {
    gamePosition?: { x: number; y: number; scale: number };
  };
  mobile?: {
    gamePosition?: { x: number; y: number; scale: number };
  };
}

export interface EditorConfig {
  // Paramètres de base
  borderStyle?: string;
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  wheelButtonPosition?: 'bottom' | 'center';
  
  // Ressources de marque
  brandAssets?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
  };
  
  // Configuration des segments de roue
  wheelSegments?: Array<{
    id: string;
    label: string;
    color: string;
    textColor?: string;
  }>;
  
  // Champs de formulaire
  formFields?: Array<{
    id: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  
  // Configuration par appareil
  deviceConfig?: {
    desktop?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
    tablet?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
    mobile?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
  };
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

const QualifioEditorLayout: React.FC = () => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [activeTab, setActiveTab] = useState<string>('design');
  const [config, setConfig] = useState<EditorConfig>({
    borderStyle: 'classic',
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: '#ff6b35',
    participateButtonTextColor: '#ffffff',
    wheelButtonPosition: 'bottom',
    wheelSegments: [
      { id: '1', label: 'Cadeau 1', color: '#4ECDC4' },
      { id: '2', label: 'Cadeau 2', color: '#F7B731' },
      { id: '3', label: 'Cadeau 3', color: '#E74C3C' },
      { id: '4', label: 'Dommage', color: '#95A5A6' }
    ],
    deviceConfig: {
      desktop: { gamePosition: { x: 0, y: 0, scale: 1 } },
      tablet: { gamePosition: { x: 0, y: 0, scale: 1 } },
      mobile: { gamePosition: { x: 0, y: 0, scale: 1 } }
    }
  });

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header avec sélecteur d'appareil */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Éditeur Qualifio</h1>
          <DeviceSelector currentDevice={currentDevice} onDeviceChange={setCurrentDevice} />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          config={config}
          onConfigUpdate={handleConfigUpdate}
          currentDevice={currentDevice}
        />

        {/* Zone de prévisualisation */}
        <Preview
          config={config}
          onConfigUpdate={handleConfigUpdate}
          currentDevice={currentDevice}
        />
      </div>
    </div>
  );
};

export default QualifioEditorLayout;

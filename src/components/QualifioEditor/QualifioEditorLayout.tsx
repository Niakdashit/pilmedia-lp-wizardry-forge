import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Palette, Settings, MousePointer, Gamepad2, Type, Image as ImageIcon, RotateCcw } from 'lucide-react';
import GeneralTab from './SidebarTabs/GeneralTab';
import GameZoneTab from './SidebarTabs/GameZoneTab';
import ButtonsTab from './SidebarTabs/ButtonsTab';
import TypographyTab from './SidebarTabs/TypographyTab';
import WheelContainer from './Preview/WheelContainer';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface EditorConfig {
  brandAssets?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    logoUrl?: string;
  };
  borderStyle?: string;
  formFields?: FormField[];
  wheelButtonPosition?: 'bottom' | 'center' | 'top';
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  deviceConfig?: {
    [key in DeviceType]: {
      backgroundImage?: string;
      fontSize?: number;
      gamePosition?: { x: number; y: number };
    };
  };
  wheelSegments?: Array<{ id: string; label: string; color?: string }>;
}

const QualifioEditorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState<EditorConfig>({
    brandAssets: {
      primaryColor: '#4ECDC4',
      secondaryColor: '#F7B731',
      accentColor: '#E74C3C'
    },
    borderStyle: 'classic',
    formFields: [],
    wheelButtonPosition: 'bottom',
    participateButtonText: 'PARTICIPER !',
    participateButtonColor: '#ff6b35',
    participateButtonTextColor: '#ffffff',
    deviceConfig: {
      desktop: {
        backgroundImage: '',
        fontSize: 16,
        gamePosition: { x: 0, y: 0 }
      },
      tablet: {
        backgroundImage: '',
        fontSize: 14,
        gamePosition: { x: 0, y: 0 }
      },
      mobile: {
        backgroundImage: '',
        fontSize: 12,
        gamePosition: { x: 0, y: 0 }
      }
    },
    wheelSegments: []
  });

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'game-zone', label: 'Zone de jeu', icon: Gamepad2 },
    { id: 'buttons', label: 'Boutons', icon: MousePointer },
    { id: 'typography', label: 'Typographie', icon: Type }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'game-zone':
        return <GameZoneTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'buttons':
        return <ButtonsTab config={config} onConfigUpdate={handleConfigUpdate} />;
      case 'typography':
        return <TypographyTab config={config} onConfigUpdate={handleConfigUpdate} />;
      default:
        return <GeneralTab config={config} onConfigUpdate={handleConfigUpdate} />;
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border h-full py-4 px-3 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sidebar-text-primary font-semibold text-lg">Configuration</h2>
          <p className="text-sidebar-text-muted text-sm">Personnalisez votre jeu</p>
        </div>

        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-item-hover ${activeTab === tab.id ? 'bg-sidebar-item-active text-white' : 'text-sidebar-text-primary'}`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-sidebar-icon'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default QualifioEditorLayout;

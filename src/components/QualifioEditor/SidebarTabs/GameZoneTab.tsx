import React, { useState, useRef } from 'react';
import { Upload, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { EditorConfig, DeviceType } from '../QualifioEditorLayout';
import GamePositionControls from '../Controls/GamePositionControls';
import { generateBrandThemeFromFile } from '../../../utils/BrandStyleAnalyzer';

interface GameZoneTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const GameZoneTab: React.FC<GameZoneTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [applyToTablet, setApplyToTablet] = useState(false);
  const [applyToMobile, setApplyToMobile] = useState(false);
  
  // Créer des refs séparés pour chaque device
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour obtenir la ref correspondant au device
  const getInputRef = (device: DeviceType) => {
    switch (device) {
      case 'desktop': return desktopInputRef;
      case 'tablet': return tabletInputRef;
      case 'mobile': return mobileInputRef;
      default: return desktopInputRef;
    }
  };

  // Fonction pour déclencher la sélection de fichier
  const triggerFileSelect = (device: DeviceType) => {
    console.log('Triggering file select for:', device);
    const inputRef = getInputRef(device);
    inputRef.current?.click();
  };

  const applyDesktopImageTo = (target: 'tablet' | 'mobile') => {
    const imageUrl = config.deviceConfig?.desktop?.backgroundImage;
    if (!imageUrl) return;
    onConfigUpdate({
      deviceConfig: {
        mobile: config.deviceConfig?.mobile || { fontSize: 14 },
        tablet: config.deviceConfig?.tablet || { fontSize: 16 },
        desktop: config.deviceConfig?.desktop || { fontSize: 18 },
        [target]: {
          ...config.deviceConfig?.[target],
          backgroundImage: imageUrl
        }
      }
    });
  };

  const handleApplyToggle = (target: 'tablet' | 'mobile', checked: boolean) => {
    if (target === 'tablet') {
      setApplyToTablet(checked);
    } else {
      setApplyToMobile(checked);
    }
    if (checked) {
      applyDesktopImageTo(target);
    }
  };

  const handleBackgroundImageUpload = async (device: DeviceType, file: File) => {
    console.log('handleBackgroundImageUpload called for:', device, 'with file:', file);
    
    if (!file || file.size === 0) {
      console.log('No file or empty file, removing image for:', device);
      const baseDeviceConfig = {
        mobile: config.deviceConfig?.mobile || { fontSize: 14 },
        tablet: config.deviceConfig?.tablet || { fontSize: 16 },
        desktop: config.deviceConfig?.desktop || { fontSize: 18 }
      };
      const newDeviceConfig: any = {
        ...baseDeviceConfig,
        [device]: {
          ...config.deviceConfig?.[device],
          backgroundImage: undefined
        }
      };
      if (device === 'desktop') {
        if (applyToTablet) {
          newDeviceConfig.tablet = {
            ...newDeviceConfig.tablet,
            backgroundImage: undefined
          };
        }
        if (applyToMobile) {
          newDeviceConfig.mobile = {
            ...newDeviceConfig.mobile,
            backgroundImage: undefined
          };
        }
      }
      onConfigUpdate({ deviceConfig: newDeviceConfig });
      return;
    }

    console.log('Reading file for:', device, 'File size:', file.size);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      console.log(`Image loaded for ${device}:`, imageUrl?.substring(0, 50) + '...');
      
      try {
        // Extract colors from background image
        const brandTheme = await generateBrandThemeFromFile(file);
        
        const baseDeviceConfig = {
          mobile: config.deviceConfig?.mobile || { fontSize: 14 },
          tablet: config.deviceConfig?.tablet || { fontSize: 16 },
          desktop: config.deviceConfig?.desktop || { fontSize: 18 }
        };
        const newDeviceConfig: any = {
          ...baseDeviceConfig,
          [device]: {
            ...config.deviceConfig?.[device],
            backgroundImage: imageUrl
          }
        };
        if (device === 'desktop') {
          if (applyToTablet) {
            newDeviceConfig.tablet = {
              ...newDeviceConfig.tablet,
              backgroundImage: imageUrl
            };
          }
          if (applyToMobile) {
            newDeviceConfig.mobile = {
              ...newDeviceConfig.mobile,
              backgroundImage: imageUrl
            };
          }
        }

        const newConfig = {
          deviceConfig: newDeviceConfig,
          // Update brand assets with extracted colors
          brandAssets: {
            ...config.brandAssets,
            primaryColor: brandTheme.customColors.primary,
            secondaryColor: brandTheme.customColors.secondary,
            accentColor: brandTheme.customColors.accent,
          }
        };
        
        console.log('Updating config for:', device, 'New config:', newConfig);
        onConfigUpdate(newConfig);
      } catch (error) {
        console.error('Error extracting colors from background image:', error);
        // Fallback: just update the image without color extraction
        const baseDeviceConfig = {
          mobile: config.deviceConfig?.mobile || { fontSize: 14 },
          tablet: config.deviceConfig?.tablet || { fontSize: 16 },
          desktop: config.deviceConfig?.desktop || { fontSize: 18 }
        };
        const newDeviceConfig: any = {
          ...baseDeviceConfig,
          [device]: {
            ...config.deviceConfig?.[device],
            backgroundImage: imageUrl
          }
        };
        if (device === 'desktop') {
          if (applyToTablet) {
            newDeviceConfig.tablet = {
              ...newDeviceConfig.tablet,
              backgroundImage: imageUrl
            };
          }
          if (applyToMobile) {
            newDeviceConfig.mobile = {
              ...newDeviceConfig.mobile,
              backgroundImage: imageUrl
            };
          }
        }
        const newConfig = {
          deviceConfig: newDeviceConfig
        };
        onConfigUpdate(newConfig);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file for:', device, error);
    };
    
    reader.readAsDataURL(file);
  };

  const handleFontSizeChange = (device: DeviceType, fontSize: number) => {
    onConfigUpdate({
      deviceConfig: {
        mobile: config.deviceConfig?.mobile || { fontSize: 14 },
        tablet: config.deviceConfig?.tablet || { fontSize: 16 },
        desktop: config.deviceConfig?.desktop || { fontSize: 18 },
        [device]: {
          ...config.deviceConfig?.[device],
          fontSize
        }
      }
    });
  };

  const devices = [{
    id: 'desktop' as DeviceType,
    label: 'PC',
    icon: Monitor
  }, {
    id: 'tablet' as DeviceType,
    label: 'Tablette',
    icon: Tablet
  }, {
    id: 'mobile' as DeviceType,
    label: 'Mobile',
    icon: Smartphone
  }];

  const currentDeviceConfig = config.deviceConfig?.[selectedDevice];

  return (
    <div className="sidebar-content my-0 py-0">
      {/* Device Selector */}
      <div className="premium-card py-0">
        <label className="block text-sm font-medium mb-4">Appareil sélectionné</label>
        <div className="flex gap-2 mb-6">
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDevice === device.id 
                  ? 'text-white' 
                  : 'text-sidebar-text-muted hover:text-sidebar-text-primary'
              }`}
              style={{
                backgroundColor: selectedDevice === device.id 
                  ? 'hsl(var(--sidebar-active))' 
                  : 'hsl(var(--sidebar-surface))',
                border: selectedDevice === device.id 
                  ? '1px solid hsl(var(--sidebar-active))' 
                  : '1px solid hsl(var(--sidebar-border))'
              }}
            >
              <device.icon className="w-4 h-4" />
              {device.label}
            </button>
          ))}
        </div>

        {/* Background Image Upload - Inputs séparés pour chaque device */}
        <div className="form-group-premium">
          <label>Image de fond ({devices.find(d => d.id === selectedDevice)?.label})</label>
          <div className="space-y-3">
            {/* Input caché pour desktop */}
            <input 
              ref={desktopInputRef}
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                console.log('Desktop file selected:', file);
                if (file) {
                  handleBackgroundImageUpload('desktop', file);
                }
              }} 
              className="hidden" 
            />
            
            {/* Input caché pour tablet */}
            <input 
              ref={tabletInputRef}
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                console.log('Tablet file selected:', file);
                if (file) {
                  handleBackgroundImageUpload('tablet', file);
                }
              }} 
              className="hidden" 
            />
            
            {/* Input caché pour mobile */}
            <input 
              ref={mobileInputRef}
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                console.log('Mobile file selected:', file);
                if (file) {
                  handleBackgroundImageUpload('mobile', file);
                }
              }} 
              className="hidden" 
            />
            
            {/* Bouton de sélection visible */}
            <button
              type="button"
              onClick={() => triggerFileSelect(selectedDevice)}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-sidebar-active transition-colors w-full"
              style={{ borderColor: 'hsl(var(--sidebar-border))' }}
            >
              <Upload className="w-5 h-5" />
              <span>Choisir une image ({selectedDevice})</span>
            </button>

            {/* Cases à cocher pour appliquer l'image PC aux autres appareils */}
            {selectedDevice === 'desktop' && (
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={applyToTablet}
                    onChange={(e) => handleApplyToggle('tablet', e.target.checked)}
                  />
                  Utiliser sur tablette
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={applyToMobile}
                    onChange={(e) => handleApplyToggle('mobile', e.target.checked)}
                  />
                  Utiliser sur mobile
                </label>
              </div>
            )}
            
            {/* Aperçu de l'image */}
            {currentDeviceConfig?.backgroundImage && (
              <div className="relative">
                <img 
                  src={currentDeviceConfig.backgroundImage} 
                  alt="Aperçu" 
                  className="w-full h-24 object-cover rounded-lg" 
                />
                <button 
                  onClick={() => handleBackgroundImageUpload(selectedDevice, new File([], ''))} 
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Font Size Control */}
        <div className="form-group-premium">
          <label htmlFor="fontSize">Taille de police ({devices.find(d => d.id === selectedDevice)?.label})</label>
          <input type="number" id="fontSize" value={currentDeviceConfig?.fontSize || 16} onChange={e => handleFontSizeChange(selectedDevice, parseInt(e.target.value))} min="8" max="72" className="w-full" />
        </div>
      </div>

      {/* Game Position Controls */}
      <div className="premium-card">
        <GamePositionControls
          config={config}
          selectedDevice={selectedDevice}
          onConfigUpdate={onConfigUpdate}
        />
      </div>

      {/* Existing controls */}
      <div className="premium-card">
        <div className="form-group-premium">
          <label htmlFor="width">Largeur (px)</label>
          <input type="number" id="width" value={config.width} onChange={e => onConfigUpdate({
          width: parseInt(e.target.value)
        })} min="200" max="1200" />
        </div>

        <div className="form-group-premium">
          <label htmlFor="height">Hauteur minimum (px)</label>
          <input type="number" id="height" value={config.height} onChange={e => onConfigUpdate({
          height: parseInt(e.target.value)
        })} min="300" max="2000" />
        </div>

        <div className="form-group-premium">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.centerText} onChange={e => onConfigUpdate({
            centerText: e.target.checked
          })} />
            Centrer le texte
          </label>
        </div>

        <div className="form-group-premium">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.centerForm} onChange={e => onConfigUpdate({
            centerForm: e.target.checked
          })} />
            Centrer le questionnaire
          </label>
        </div>

        <div className="form-group-premium">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={config.centerGameZone} onChange={e => onConfigUpdate({
            centerGameZone: e.target.checked
          })} />
            Centrer le formulaire
          </label>
        </div>

        <div className="form-group-premium">
          <label htmlFor="backgroundColor">Couleur de fond du concours</label>
          <div className="color-input-group">
            <input type="color" id="backgroundColor" value={config.backgroundColor} onChange={e => onConfigUpdate({
            backgroundColor: e.target.value
          })} />
            <input type="text" value={config.backgroundColor} onChange={e => onConfigUpdate({
            backgroundColor: e.target.value
          })} placeholder="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameZoneTab;

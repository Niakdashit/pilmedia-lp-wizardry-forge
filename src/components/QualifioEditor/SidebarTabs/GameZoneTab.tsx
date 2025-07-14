import React, { useState } from 'react';
import { Upload, Monitor, Tablet, Smartphone } from 'lucide-react';
import type { EditorConfig, DeviceType } from '../QualifioEditorLayout';
interface GameZoneTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}
const GameZoneTab: React.FC<GameZoneTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const handleBackgroundImageUpload = (device: DeviceType, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const imageUrl = e.target?.result as string;
      onConfigUpdate({
        deviceConfig: {
          mobile: {
            fontSize: 14,
            ...config.deviceConfig?.mobile
          },
          tablet: {
            fontSize: 16,
            ...config.deviceConfig?.tablet
          },
          desktop: {
            fontSize: 18,
            ...config.deviceConfig?.desktop
          },
          [device]: {
            fontSize: 16,
            ...config.deviceConfig?.[device],
            backgroundImage: imageUrl
          }
        }
      });
    };
    reader.readAsDataURL(file);
  };
  const handleFontSizeChange = (device: DeviceType, fontSize: number) => {
    onConfigUpdate({
      deviceConfig: {
        mobile: {
          fontSize: 14,
          ...config.deviceConfig?.mobile
        },
        tablet: {
          fontSize: 16,
          ...config.deviceConfig?.tablet
        },
        desktop: {
          fontSize: 18,
          ...config.deviceConfig?.desktop
        },
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
  return <div className="sidebar-content my-0 py-0">
      
      
      {/* Device Selector */}
      <div className="premium-card py-0">
        <label className="block text-sm font-medium mb-4">Appareil sélectionné</label>
        <div className="flex gap-2 mb-6">
          {devices.map(device => <button key={device.id} onClick={() => setSelectedDevice(device.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedDevice === device.id ? 'text-white' : 'text-sidebar-text-muted hover:text-sidebar-text-primary'}`} style={{
          backgroundColor: selectedDevice === device.id ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-surface))',
          border: selectedDevice === device.id ? '1px solid hsl(var(--sidebar-active))' : '1px solid hsl(var(--sidebar-border))'
        }}>
              <device.icon className="w-4 h-4" />
              {device.label}
            </button>)}
        </div>

        {/* Background Image Upload */}
        <div className="form-group-premium">
          <label htmlFor="backgroundImage">Image de fond ({devices.find(d => d.id === selectedDevice)?.label})</label>
          <div className="space-y-3">
            <input type="file" id="backgroundImage" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              handleBackgroundImageUpload(selectedDevice, file);
            }
          }} className="hidden" />
            <label htmlFor="backgroundImage" className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-sidebar-active transition-colors" style={{
            borderColor: 'hsl(var(--sidebar-border))'
          }}>
              <Upload className="w-5 h-5" />
              <span>Choisir une image</span>
            </label>
            {currentDeviceConfig?.backgroundImage && <div className="relative">
                <img src={currentDeviceConfig.backgroundImage} alt="Aperçu" className="w-full h-24 object-cover rounded-lg" />
                <button onClick={() => handleBackgroundImageUpload(selectedDevice, new File([], ''))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                  ×
                </button>
              </div>}
          </div>
        </div>

        {/* Font Size Control */}
        <div className="form-group-premium">
          <label htmlFor="fontSize">Taille de police ({devices.find(d => d.id === selectedDevice)?.label})</label>
          <input type="number" id="fontSize" value={currentDeviceConfig?.fontSize || 16} onChange={e => handleFontSizeChange(selectedDevice, parseInt(e.target.value))} min="8" max="72" className="w-full" />
        </div>
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
    </div>;
};
export default GameZoneTab;
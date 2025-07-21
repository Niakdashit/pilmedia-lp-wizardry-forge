
import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Type, Plus, Trash2, Palette, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { EditorConfig, CustomText } from '../GameEditorLayout';
import ColorThief from 'colorthief';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DesignContentTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignContentTab: React.FC<DesignContentTabProps> = ({
  config,
  onConfigUpdate
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [applyToTablet, setApplyToTablet] = useState(false);
  const [applyToMobile, setApplyToMobile] = useState(false);
  
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const tabletInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const devices = [
    { id: 'desktop' as DeviceType, label: 'Desktop', icon: Monitor },
    { id: 'tablet' as DeviceType, label: 'Tablette', icon: Tablet },
    { id: 'mobile' as DeviceType, label: 'Mobile', icon: Smartphone }
  ];

  const currentDeviceConfig = config.deviceConfig?.[selectedDevice];

  const triggerFileSelect = (device: DeviceType) => {
    const inputRef = device === 'desktop' ? desktopInputRef : 
                    device === 'tablet' ? tabletInputRef : mobileInputRef;
    inputRef.current?.click();
  };

  const applyDesktopImageTo = (target: 'tablet' | 'mobile') => {
    const imageUrl = config.deviceConfig?.desktop?.backgroundImage;
    if (!imageUrl) return;
    
    const defaultConfigs = {
      mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
      tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
      desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
    };
    
    onConfigUpdate({
      deviceConfig: {
        mobile: config.deviceConfig?.mobile || defaultConfigs.mobile,
        tablet: config.deviceConfig?.tablet || defaultConfigs.tablet,
        desktop: config.deviceConfig?.desktop || defaultConfigs.desktop,
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

  const extractColorsFromImage = async (imageUrl: string) => {
    try {
      console.log('🎨 Début d\'extraction des couleurs depuis l\'image:', imageUrl);
      
      // Créer une image pour ColorThief
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const colorThief = new ColorThief();
            
            // Extraire la couleur dominante et la palette
            const dominantColor = colorThief.getColor(img);
            const palette = colorThief.getPalette(img, 3);
            
            console.log('🎯 Couleur dominante extraite:', dominantColor);
            console.log('🎨 Palette extraite:', palette);
            
            // Convertir RGB en hex
            const rgbToHex = (r: number, g: number, b: number) => 
              "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            
            const extractedColors = {
              primary: rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]),
              secondary: palette[1] ? rgbToHex(palette[1][0], palette[1][1], palette[1][2]) : rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]),
              accent: palette[2] ? rgbToHex(palette[2][0], palette[2][1], palette[2][2]) : rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])
            };
            
            console.log('✅ Couleurs extraites avec succès:', extractedColors);
            resolve(extractedColors);
            
          } catch (error) {
            console.error('❌ Erreur lors de l\'extraction des couleurs:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('❌ Erreur lors du chargement de l\'image pour extraction de couleurs');
          reject(new Error('Impossible de charger l\'image'));
        };
        
        img.src = imageUrl;
      });
      
    } catch (error) {
      console.error('❌ Erreur générale extraction couleurs:', error);
      throw error;
    }
  };

  const handleBackgroundImageUpload = async (device: DeviceType, file: File) => {
    console.log('handleBackgroundImageUpload called for:', device, 'with file:', file);
    
    const defaultConfigs = {
      mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
      tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
      desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
    };
    
    if (!file || file.size === 0) {
      console.log('No file or empty file, removing image for:', device);
      const newDeviceConfig: any = {
        mobile: config.deviceConfig?.mobile || defaultConfigs.mobile,
        tablet: config.deviceConfig?.tablet || defaultConfigs.tablet,
        desktop: config.deviceConfig?.desktop || defaultConfigs.desktop,
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

    try {
      const imageUrl = URL.createObjectURL(file);
      console.log('Image URL created:', imageUrl);
      
      // Extraction automatique des couleurs depuis l'image
      console.log('🚀 Début d\'extraction automatique des couleurs...');
      
      try {
        const extractedColors = await extractColorsFromImage(imageUrl) as any;
        console.log('🎨 Application des couleurs extraites:', extractedColors);
        
        // Mise à jour de la configuration avec les nouvelles couleurs ET l'image
        const newDeviceConfig: any = {
          mobile: config.deviceConfig?.mobile || defaultConfigs.mobile,
          tablet: config.deviceConfig?.tablet || defaultConfigs.tablet,
          desktop: config.deviceConfig?.desktop || defaultConfigs.desktop,
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
        
        // Application des couleurs extraites à la configuration
        onConfigUpdate({ 
          deviceConfig: newDeviceConfig,
          // Appliquer les couleurs extraites
          backgroundColor: extractedColors.primary + '20', // Avec transparence
          outlineColor: extractedColors.accent,
          // Couleurs pour la mécanisme de jeu via brandAssets
          brandAssets: {
            ...config.brandAssets,
            primaryColor: extractedColors.primary,
            secondaryColor: extractedColors.secondary,
            accentColor: extractedColors.accent
          }
        });
        
        console.log('✅ Configuration mise à jour avec image et couleurs extraites');
        
      } catch (colorError) {
        console.warn('⚠️ Impossible d\'extraire les couleurs, application de l\'image uniquement:', colorError);
        
        // Fallback: appliquer uniquement l'image sans extraction de couleurs
        const newDeviceConfig: any = {
          mobile: config.deviceConfig?.mobile || defaultConfigs.mobile,
          tablet: config.deviceConfig?.tablet || defaultConfigs.tablet,
          desktop: config.deviceConfig?.desktop || defaultConfigs.desktop,
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
        
        onConfigUpdate({ deviceConfig: newDeviceConfig });
      }
      
      console.log('Configuration updated with new image');
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
    }
  };
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newImage = {
        id: Date.now().toString(),
        src: imageUrl,
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0
      };
      onConfigUpdate({
        design: {
          ...config.design,
          customImages: [...(config.design?.customImages || []), newImage]
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageId: string) => {
    onConfigUpdate({
      design: {
        ...config.design,
        customImages: (config.design?.customImages || []).filter((img: any) => img.id !== imageId)
      }
    });
  };

  const addCustomText = () => {
    const newText: CustomText = {
      id: Date.now().toString(),
      content: 'Nouveau texte',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      width: 200,
      height: 50
    };
    
    onConfigUpdate({
      customTexts: [...(config.customTexts || []), newText]
    });
  };

  const removeCustomText = (textId: string) => {
    onConfigUpdate({
      customTexts: (config.customTexts || []).filter(text => text.id !== textId)
    });
  };

  return (
    <div className="space-y-6 my-[30px]">
      <h3 className="section-title text-center">Design & Contenu</h3>
      
      {/* Background & Colors */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs et arrière-plan
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input 
                type="color" 
                value={config.backgroundColor || '#ffffff'} 
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })} 
              />
              <input 
                type="text" 
                value={config.backgroundColor || '#ffffff'} 
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })} 
                placeholder="#ffffff" 
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur de contour</label>
            <div className="color-input-group">
              <input 
                type="color" 
                value={config.outlineColor || '#ffffff'} 
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })} 
              />
              <input 
                type="text" 
                value={config.outlineColor || '#ffffff'} 
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })} 
                placeholder="#ffffff" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Images de fond par appareil
        </h4>
        
        {/* Device Selector */}
        <div className="form-group-premium">
          <label className="block text-sm font-medium mb-4">Appareil sélectionné</label>
          <div className="flex gap-2 mb-6">
            {devices.map(device => (
              <button 
                key={device.id} 
                onClick={() => setSelectedDevice(device.id)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDevice === device.id ? 'text-white' : 'text-sidebar-text-muted hover:text-sidebar-text-primary'
                }`} 
                style={{
                  backgroundColor: selectedDevice === device.id ? 'hsl(var(--sidebar-active))' : 'hsl(var(--sidebar-surface))',
                  border: selectedDevice === device.id ? '1px solid hsl(var(--sidebar-active))' : '1px solid hsl(var(--sidebar-border))'
                }}
              >
                <device.icon className="w-4 h-4" />
                {device.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background Image Upload */}
        <div className="form-group-premium">
          <label>Image de fond ({devices.find(d => d.id === selectedDevice)?.label})</label>
          <div className="space-y-3">
            {/* Hidden inputs for each device */}
            <input 
              ref={desktopInputRef} 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBackgroundImageUpload('desktop', file);
                }
              }} 
              className="hidden" 
            />
            
            <input 
              ref={tabletInputRef} 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBackgroundImageUpload('tablet', file);
                }
              }} 
              className="hidden" 
            />
            
            <input 
              ref={mobileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBackgroundImageUpload('mobile', file);
                }
              }} 
              className="hidden" 
            />
            
            {/* Upload button */}
            <button 
              type="button" 
              onClick={() => triggerFileSelect(selectedDevice)} 
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-sidebar-active transition-colors w-full" 
              style={{ borderColor: 'hsl(var(--sidebar-border))' }}
            >
              <Upload className="w-5 h-5" />
              <span>Choisir une image ({selectedDevice})</span>
            </button>

            {/* Apply to other devices (only for desktop) */}
            {selectedDevice === 'desktop' && (
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    checked={applyToTablet} 
                    onChange={e => handleApplyToggle('tablet', e.target.checked)} 
                  />
                  Utiliser sur tablette
                </label>
                <label className="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    checked={applyToMobile} 
                    onChange={e => handleApplyToggle('mobile', e.target.checked)} 
                  />
                  Utiliser sur mobile
                </label>
              </div>
            )}
            
            {/* Image preview */}
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
      </div>

      {/* Custom Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Images personnalisées
        </h4>
        
        <div className="space-y-4">
          <label className="w-full h-32 bg-sidebar-surface rounded-xl flex items-center justify-center border-2 border-dashed border-sidebar-border cursor-pointer hover:bg-sidebar-hover transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }} 
              className="hidden" 
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-sidebar-text mx-auto mb-2" />
              <span className="text-sidebar-text text-sm font-medium">Ajouter une image</span>
              <p className="text-sidebar-text-muted text-xs mt-1">PNG, JPG jusqu'à 10MB</p>
            </div>
          </label>

          {config.design?.customImages && config.design.customImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {config.design.customImages.map((image: any) => (
                <div key={image.id} className="relative group">
                  <div className="w-full aspect-square bg-sidebar-surface rounded-lg overflow-hidden border border-sidebar-border">
                    <img src={image.src} alt="Image personnalisée" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Texts */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Type className="w-4 h-4" />
          Textes personnalisés
        </h4>
        
        <div className="space-y-4">
          <button
            onClick={addCustomText}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-sidebar-border rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-text"
          >
            <Plus className="w-4 h-4" />
            Ajouter un texte
          </button>

          {config.customTexts && config.customTexts.length > 0 && (
            <div className="space-y-3">
              {config.customTexts.map((text) => (
                <div key={text.id} className="bg-sidebar-surface rounded-lg p-3 border border-sidebar-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sidebar-text-primary font-medium text-sm truncate">
                      {text.content || 'Texte sans contenu'}
                    </span>
                    <button
                      onClick={() => removeCustomText(text.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-sidebar-text-muted">
                    Position: {text.x}%, {text.y}% • Taille: {text.fontSize}px
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Text Areas */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Textes principaux</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte de l'histoire</label>
            <textarea
              value={config.storyText || ''}
              onChange={e => onConfigUpdate({ storyText: e.target.value })}
              rows={4}
              placeholder="Racontez votre histoire..."
            />
          </div>

          <div className="form-group-premium">
            <label>Lien éditeur</label>
            <input
              type="text"
              value={config.publisherLink || ''}
              onChange={e => onConfigUpdate({ publisherLink: e.target.value })}
              placeholder="www.exemple.com"
            />
          </div>

          <div className="form-group-premium">
            <label>Description du prix</label>
            <textarea
              value={config.prizeText || ''}
              onChange={e => onConfigUpdate({ prizeText: e.target.value })}
              rows={3}
              placeholder="Décrivez le prix à gagner..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignContentTab;


import React, { useEffect } from 'react';
import ImageUpload from '../../common/ImageUpload';
import { useEditorStore } from '../../../stores/editorStore';

interface BackgroundSettingsProps {
  design: any;
  setCampaign: (campaign: any) => void;
  campaign: any;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  design,
  setCampaign,
  campaign
}) => {
  const updateDesign = useEditorStore(state => state.updateDesign);

  const handleBackgroundImageChange = (imageUrl: string, device: 'desktop' | 'mobile') => {
    const updates = device === 'mobile' 
      ? { mobileBackgroundImage: imageUrl }
      : { backgroundImage: imageUrl };
    
    console.log('🖼️ [BackgroundSettings] Changing background:', {
      device,
      imageUrl,
      updates
    });
    
    // Mise à jour du state local
    setCampaign({
      ...campaign,
      design: {
        ...design,
        ...updates
      },
      _lastUpdate: Date.now()
    });

    // Mise à jour du store global pour le preview
    updateDesign(updates);

    // Stockage dans localStorage pour la persistance
    try {
      const storageKey = device === 'mobile' ? 'modern-bg-mobile' : 'modern-bg-desktop';
      if (imageUrl) {
        localStorage.setItem(storageKey, imageUrl);
      } else {
        localStorage.removeItem(storageKey);
      }
      // Synchronisation inter-fenêtres
      window.dispatchEvent(new CustomEvent('modern-bg-sync', { detail: { device, url: imageUrl } }));
    } catch (e) {
      console.warn('Erreur localStorage:', e);
    }
  };

  // Charger les fonds depuis localStorage au montage
  useEffect(() => {
    console.log('🖼️ [BackgroundSettings] Current design backgrounds:', {
      backgroundImage: design.backgroundImage,
      mobileBackgroundImage: design.mobileBackgroundImage
    });
    
    try {
      const desktopBg = localStorage.getItem('modern-bg-desktop');
      const mobileBg = localStorage.getItem('modern-bg-mobile');
      
      console.log('🖼️ [BackgroundSettings] localStorage backgrounds:', {
        desktopBg,
        mobileBg
      });
      
      if (desktopBg || mobileBg) {
        const updates: any = {};
        if (desktopBg && !design.backgroundImage) updates.backgroundImage = desktopBg;
        if (mobileBg && !design.mobileBackgroundImage) updates.mobileBackgroundImage = mobileBg;
        
        if (Object.keys(updates).length > 0) {
          console.log('🖼️ [BackgroundSettings] Applying localStorage backgrounds:', updates);
          setCampaign((prev: any) => ({
            ...prev,
            design: {
              ...prev.design,
              ...updates
            }
          }));
          updateDesign(updates);
        }
      }
    } catch (e) {
      console.warn('Erreur chargement localStorage:', e);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Arrière-plan</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur de fond
        </label>
        <input
          type="color"
          value={design.background || '#f8fafc'}
          onChange={(e) =>
            setCampaign({
              ...campaign,
              design: { ...design, background: e.target.value },
              _lastUpdate: Date.now()
            })
          }
          className="w-full h-10 rounded-lg border border-gray-300"
        />
      </div>

      <div>
        <ImageUpload
          value={design.backgroundImage || ''}
          onChange={(url) => handleBackgroundImageChange(url, 'desktop')}
          label="Image de fond Desktop/Tablette"
        />
      </div>

      <div>
        <ImageUpload
          value={design.mobileBackgroundImage || ''}
          onChange={(url) => handleBackgroundImageChange(url, 'mobile')}
          label="Image de fond Mobile"
        />
      </div>
    </div>
  );
};

export default BackgroundSettings;

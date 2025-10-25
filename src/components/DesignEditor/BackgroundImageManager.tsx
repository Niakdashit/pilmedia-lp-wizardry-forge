import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useEditorStore } from '@/stores/editorStore';

interface BackgroundImageManagerProps {
  campaignId?: string;
  currentBackground?: { type: 'color' | 'image'; value: string };
  onBackgroundChange: (background: { type: 'color' | 'image'; value: string }) => void;
}

const BackgroundImageManager: React.FC<BackgroundImageManagerProps> = ({
  campaignId,
  currentBackground,
  onBackgroundChange
}) => {
  const { saveCampaign } = useCampaigns();
  const campaignState = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Charger l'image existante au montage
  useEffect(() => {
    if (currentBackground?.type === 'image' && currentBackground.value) {
      setUploadedImage(currentBackground.value);
    }
  }, [currentBackground]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    console.log('📤 [BackgroundImageManager] Starting image upload:', file.name);

    try {
      // Simulation d'upload - remplacer par votre vraie logique d'upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Créer une URL temporaire pour l'aperçu immédiat
      const tempUrl = URL.createObjectURL(file);
      setUploadedImage(tempUrl);

      // Appliquer immédiatement le changement d'arrière-plan
      const newBackground = { type: 'image' as const, value: tempUrl };
      onBackgroundChange(newBackground);

      // Sauvegarder directement en base de données
      if (campaignId || campaignState?.id) {
        const currentCampaignId = campaignId || (campaignState as any)?.id;
        
        console.log('💾 [BackgroundImageManager] Saving background image to DB:', {
          campaignId: currentCampaignId,
          imageUrl: tempUrl
        });

        // Sauvegarder avec une structure simple et directe
        const savePayload = {
          id: currentCampaignId,
          design: {
            ...((campaignState as any)?.design || {}),
            backgroundImage: tempUrl,
            background: tempUrl, // Double sauvegarde pour compatibilité
          }
        };

        const savedCampaign = await saveCampaign(savePayload);
        
        if (savedCampaign) {
          console.log('✅ [BackgroundImageManager] Background image saved successfully');
          
          // Mettre à jour le store local
          setCampaign((prev: any) => ({
            ...prev,
            design: {
              ...prev?.design,
              backgroundImage: tempUrl,
              background: tempUrl,
            }
          }));
        }
      }

    } catch (error) {
      console.error('❌ [BackgroundImageManager] Error uploading background image:', error);
      alert('Erreur lors de l\'upload de l\'image de fond');
      // Revenir à l'ancien état en cas d'erreur
      if (currentBackground) {
        setUploadedImage(currentBackground.type === 'image' ? currentBackground.value : null);
        onBackgroundChange(currentBackground);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    console.log('🗑️ [BackgroundImageManager] Removing background image');
    
    setUploadedImage(null);
    const newBackground = { type: 'color' as const, value: '#ffffff' };
    onBackgroundChange(newBackground);

    // Sauvegarder la suppression en base
    if (campaignId || campaignState?.id) {
      const currentCampaignId = campaignId || (campaignState as any)?.id;
      
      const savePayload = {
        id: currentCampaignId,
        design: {
          ...((campaignState as any)?.design || {}),
          backgroundImage: null,
          background: '#ffffff',
        }
      };

      try {
        await saveCampaign(savePayload);
        console.log('✅ [BackgroundImageManager] Background image removed from DB');
        
        setCampaign((prev: any) => ({
          ...prev,
          design: {
            ...prev?.design,
            backgroundImage: null,
            background: '#ffffff',
          }
        }));
      } catch (error) {
        console.error('❌ [BackgroundImageManager] Error removing background image:', error);
      }
    }
  };

  const triggerFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Image de fond</h3>
        {uploadedImage && (
          <button
            onClick={handleRemoveImage}
            className="text-red-500 hover:text-red-700 p-1"
            title="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {uploadedImage ? (
        <div className="relative group">
          <img
            src={uploadedImage}
            alt="Image de fond"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              {isUploading ? 'Upload...' : 'Changer'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Cliquer pour ajouter une image de fond</span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-gray-500">
        Formats supportés: JPG, PNG, WEBP (max 10MB)
      </p>
    </div>
  );
};

export default BackgroundImageManager;
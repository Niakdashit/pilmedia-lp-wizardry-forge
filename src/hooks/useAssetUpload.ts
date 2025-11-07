import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AssetUploadOptions {
  campaignId: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadedAsset {
  url: string;
  path: string;
  publicUrl: string;
  size: number;
}

export const useAssetUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAsset = useCallback(async (options: AssetUploadOptions): Promise<UploadedAsset | null> => {
    const { campaignId, file, onProgress } = options;

    setIsUploading(true);
    setProgress(0);

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('Fichier trop volumineux (max 10MB)');
        return null;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté');
        return null;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${campaignId}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('campaign-assets')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(data.path);

      const asset: UploadedAsset = {
        url: urlData.publicUrl,
        path: data.path,
        publicUrl: urlData.publicUrl,
        size: file.size,
      };

      setProgress(100);
      onProgress?.(100);
      toast.success('Asset uploadé avec succès');

      return asset;
    } catch (error) {
      console.error('[AssetUpload] Error:', error);
      toast.error('Erreur lors de l\'upload');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('campaign-assets')
        .remove([path]);

      if (error) throw error;

      toast.success('Asset supprimé');
      return true;
    } catch (error) {
      console.error('[AssetUpload] Delete error:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  return {
    uploadAsset,
    deleteAsset,
    isUploading,
    progress,
  };
};

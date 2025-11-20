import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
import { useFastCampaignLoader } from '@/hooks/useFastCampaignLoader';
import { useIsMobile } from '@/hooks/useIsMobile';
import { isTempCampaignId } from '@/utils/tempCampaignId';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

/**
 * FullscreenPreview - Page de prévisualisation plein écran
 * 
 * Affiche le rendu final d'une campagne en plein écran navigateur
 * avec un sélecteur de device (Desktop/Tablet/Mobile)
 */
const FullscreenPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  // Détection device depuis URL ou détection auto
  const deviceParam = searchParams.get('device');
  const isMobileDevice = useIsMobile();
  const isTabletDevice = !isMobileDevice && window.innerWidth >= 768 && window.innerWidth < 1024;
  
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile' | 'tablet'>(() => {
    if (deviceParam === 'desktop' || deviceParam === 'mobile' || deviceParam === 'tablet') {
      return deviceParam;
    }
    return isMobileDevice ? 'mobile' : isTabletDevice ? 'tablet' : 'desktop';
  });

  const previewMode = selectedDevice;

  // Load campaign data
  const { campaign, isLoading } = useFastCampaignLoader({
    campaignId: id || null,
    enabled: !!id && !isTempCampaignId(id)
  });

  // Gestion du device switcher
  const handleDeviceChange = (device: 'desktop' | 'mobile' | 'tablet') => {
    setSelectedDevice(device);
    setSearchParams({ device });
  };

  // Masquer la toolbar après 3 secondes d'inactivité
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowToolbar(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowToolbar(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setShowToolbar(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Validation de la campagne
  useEffect(() => {
    if (!id) {
      setError('Aucune campagne spécifiée');
      return;
    }

    if (isTempCampaignId(id)) {
      setError('Cette campagne est un brouillon temporaire. Veuillez la sauvegarder pour obtenir un aperçu.');
      return;
    }

    if (!isLoading && campaign) {
      // Debug: Vérifier le contenu de la campagne
      console.log('🔍 [FullscreenPreview] Campaign loaded:', {
        id: campaign.id,
        type: campaign.type,
        name: campaign.name,
        'config.modularPage': campaign.config?.modularPage,
        'design.designModules': campaign.design?.designModules,
        'modularPage': campaign.modularPage,
        'formFields': campaign.formFields,
        'form_fields': campaign.form_fields
      });
      setIsReady(true);
    } else if (!isLoading && !campaign) {
      setError('Campagne introuvable');
    }
  }, [id, campaign, isLoading]);

  // Fermer l'aperçu (retour en arrière)
  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/campaigns');
    }
  };

  // Gestion du clavier (Échap pour fermer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state
  if (isLoading || (!isReady && !error)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <p className="text-sm text-muted-foreground mb-4">{error || 'Campagne introuvable'}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Barre d'outils overlay */}
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-black/60 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Nom de la campagne */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-white font-semibold text-sm truncate max-w-md">
                {campaign.name}
              </h2>
            </div>

            {/* Sélecteur de device */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 border border-white/20">
              <button
                onClick={() => handleDeviceChange('desktop')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  selectedDevice === 'desktop'
                    ? 'bg-white/20 shadow-sm text-white ring-1 ring-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeviceChange('tablet')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  selectedDevice === 'tablet'
                    ? 'bg-white/20 shadow-sm text-white ring-1 ring-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeviceChange('mobile')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  selectedDevice === 'mobile'
                    ? 'bg-white/20 shadow-sm text-white ring-1 ring-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone de preview plein écran */}
      <div className="h-full w-full overflow-hidden">
        <div className="h-full w-full" style={{
          backgroundColor: campaign.type === 'form' ? undefined : 'transparent'
        }}>
          <PreviewRenderer campaign={campaign} previewMode={previewMode} />
        </div>
      </div>

      {/* Indicateur d'aide en bas */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ${
          showToolbar ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
          <p className="text-white/80 text-xs">
            Appuyez sur <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">Échap</kbd> pour fermer
          </p>
        </div>
      </div>
    </div>
  );
};

export default FullscreenPreview;
